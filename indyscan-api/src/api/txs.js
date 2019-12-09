const { esAndFilters } = require('indyscan-storage/src/es/es-query-builder')
const { asyncHandler } = require('../middleware')
const validate = require('express-validation')
const Joi = require('joi')
const url = require('url')
const indyscanStorage = require('indyscan-storage')
const {esFullTextsearch} = require('indyscan-storage/src/es/es-query-builder')
const { esTxFilters } = indyscanStorage

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

  function getTxRange (fromRecentTx, toRecentTx) {
    if (fromRecentTx !== undefined && fromRecentTx !== null) {
      if (typeof fromRecentTx === 'string') {
        fromRecentTx = parseInt(fromRecentTx)
      }
    } else {
      fromRecentTx = 0
    }
    if (toRecentTx !== undefined && toRecentTx !== null) {
      if (typeof toRecentTx === 'string') {
        toRecentTx = parseInt(toRecentTx)
      }
    } else {
      toRecentTx = 10
    }
    if (Math.abs(fromRecentTx - toRecentTx) > 150) {
      throw Error(`Request transaction range too big.`)
    }
    return {
      skip: Math.min(fromRecentTx, toRecentTx),
      size: Math.max(fromRecentTx, toRecentTx) - Math.min(fromRecentTx, toRecentTx)
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
          format: Joi.string().valid(['original', 'full'])
        }
      }
    ),
    asyncHandler(async function (req, res) {
      const parts = url.parse(req.url, true)
      const networkId = getNetworkId(req, res)
      let { ledger } = req.params
      let { fromRecentTx, toRecentTx, filterTxNames, search, format } = parts.query
      let { skip, size } = getTxRange(fromRecentTx, toRecentTx)
      let txTypeQuery = urlQueryTxNamesToEsQuery(filterTxNames)
      let searchQuery = search ? esFullTextsearch(search) : null
      if (format === 'original') {
        let txs = await ledgerStorageManager.getStorage(networkId, ledger).getTxs(skip, size, esAndFilters(txTypeQuery, searchQuery))
        res.status(200).send(txs)
      } else {
        let txs = await ledgerStorageManager.getStorage(networkId, ledger).getFullTxs(skip, size, esAndFilters(txTypeQuery, searchQuery))
        res.status(200).send(txs)
      }
    }))

  app.get('/api/networks/:networkRef/ledgers/:ledger/txs/:seqNo',
    validate(
      {
        query: {
          format: Joi.string().valid(['original', 'full'])
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
      const tx = (format === 'original') ? await storage.getTxBySeqNo(parsedSeqNo) : await storage.getFullTxBySeqNo(parsedSeqNo)
      res.status(200).send(tx)
    }))

  app.get('/api/networks/:networkRef/ledgers/:ledger/txs/stats/count',
    validate(
      {
        query: {
          filterTxNames: Joi.array().items(Joi.string()).required(),
        }
      }
    ),
    asyncHandler(async function (req, res) {
      const parts = url.parse(req.url, true)
      const { ledger } = req.params
      const networkId = getNetworkId(req, res)
      const { filterTxNames } = parts.query
      const txCount = await ledgerStorageManager.getStorage(networkId, ledger).getTxCount(urlQueryTxNamesToEsQuery(filterTxNames))
      res.status(200).send({ txCount })
    }))

  return app
}

module.exports = initTxsApi
