const { esAndFilters } = require('indyscan-storage/src/es/es-query-builder')
const { asyncHandler } = require('../middleware')
const validate = require('express-validation')
const Joi = require('joi')
const url = require('url')
const indyscanStorage = require('indyscan-storage')
const { esFullTextsearch } = require('indyscan-storage/src/es/es-query-builder')
const { esTxFilters } = indyscanStorage
const logger = require('../logging/logger-main')
const util = require('util')

function initTxsApi (app, ledgerStorageManager, networkManager) {
  function getNetworkId (req, res) {
    const { networkRef } = req.params
    try {
      return networkManager.getNetworkConfig(networkRef).id
    } catch (err) {
      return res.status(404).send({ message: `Couldn't resolve network you are referencing (${networkRef})` })
    }
  }

  function urlQueryTxNamesToEsQuery (urlQueryTxNames) {
    const filterTxNames = (urlQueryTxNames) ? JSON.parse(urlQueryTxNames) : []
    if (filterTxNames.length === 0) {
      return null
    } else {
      return esTxFilters.esFilterByTxTypeNames(filterTxNames)
    }
  }

  app.get('/api/networks/:networkRef/ledgers/:ledger/txs',
    validate(
      {
        query: {
          fromRecentTx: Joi.number(),
          toRecentTx: Joi.number(),
          filterTxNames: Joi.array().items(Joi.string()),
          search: Joi.string(),
          format: Joi.string().valid(['original', 'full', 'indyscan'])
        }
      }
    ),
    asyncHandler(async function (req, res) {
      const parts = url.parse(req.url, true)
      const networkId = getNetworkId(req, res)
      let { ledger } = req.params
      let { skip, size, filterTxNames, search, format, sortFromRecent } = parts.query
      skip = skip || 0
      size = size || 50
      // let { skip, size } = getTxRange(fromRecentTx, toRecentTx)
      let txTypeQuery = urlQueryTxNamesToEsQuery(filterTxNames)
      let searchQuery = search ? esFullTextsearch(search) : null
      let finalQuery = esAndFilters(txTypeQuery, searchQuery)
      let txs
      console.log(`sortFromRecent =${sortFromRecent} type ${typeof sortFromRecent}`)
      let sort = (sortFromRecent === 'true' || sortFromRecent === undefined || sortFromRecent === null)
        ? { 'indyscan.txnMetadata.seqNo': { 'order': 'desc' } }
        : { 'indyscan.txnMetadata.seqNo': { 'order': 'asc' } }
      try {
        switch (format) {
          case 'original':
            txs = await ledgerStorageManager.getStorage(networkId, ledger).getTxs(skip, size, finalQuery, sort)
            break
          case 'full':
            txs = await ledgerStorageManager.getStorage(networkId, ledger).getManyTxs(skip, size, finalQuery, sort)
            break
          case 'indyscan':
            txs = (await ledgerStorageManager.getStorage(networkId, ledger).getManyTxs(skip, size, finalQuery, sort))
              .map(tx => tx.indyscan)
            break
          default:
            res.status(500).send({ message: 'Reached supposedly unreachable.' })
        }
        res.status(200).send(txs)
      } catch (e) {
        logger.error(`Problem fetching transactions networkId=${networkId} ledger=${ledger} query=${JSON.stringify(finalQuery)}`)
        logger.error(util.inspect(e))
        res.status(500).send()
      }
    }))

  app.get('/api/networks/:networkRef/ledgers/:ledger/txs/:seqNo',
    validate(
      {
        query: {
          format: Joi.string().valid(['original', 'full', 'indyscan'])
        }
      }
    ),
    asyncHandler(async function (req, res) {
      let { ledger, seqNo } = req.params
      let { format } = req.query
      format = format || 'original'
      const networkId = getNetworkId(req, res)
      let parsedSeqNo
      try {
        parsedSeqNo = parseInt(seqNo)
      } catch (e) {
        res.status(400).send({ message: `seqNo must be number` })
      }
      const storage = await ledgerStorageManager.getStorage(networkId, ledger)
      let tx
      switch (format) {
        case 'original':
          tx = await storage.getTxBySeqNo(parsedSeqNo)
          break
        case 'full':
          tx = await storage.getOneTx(parsedSeqNo)
          break
        case 'indyscan':
          tx = (await storage.getOneTx(parsedSeqNo)).indyscan
          break
        default:
          throw Error('This should be unreachable code.')
      }
      res.status(200).send(tx)
    }))

  app.get('/api/networks/:networkRef/ledgers/:ledger/txs/stats/count',
    validate(
      {
        query: {
          filterTxNames: Joi.array().items(Joi.string()).required()
        }
      }
    ),
    asyncHandler(async function (req, res) {
      const parts = url.parse(req.url, true)
      const { ledger } = req.params
      const networkId = getNetworkId(req, res)
      const { filterTxNames, search } = parts.query
      let txTypeQuery = urlQueryTxNamesToEsQuery(filterTxNames)
      let searchQuery = search ? esFullTextsearch(search) : null
      let finalQuery = esAndFilters(txTypeQuery, searchQuery)
      try {
        const txCount = await ledgerStorageManager.getStorage(networkId, ledger).getTxCount(finalQuery)
        res.status(200).send({ txCount })
      } catch (e) {
        logger.error(`Problem counting transactions networkId=${networkId} ledger=${ledger} query=${JSON.stringify(finalQuery)}`)
        logger.error(util.inspect(e))
        res.status(500).send()
      }
    }))

  return app
}

module.exports = initTxsApi
