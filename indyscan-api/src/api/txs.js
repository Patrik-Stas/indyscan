const { asyncHandler } = require('../middleware')
const validate = require('express-validation')
const Joi = require('joi')
const logger = require('../logging/logger-main')
const url = require('url')
const indyscanStorage = require('indyscan-storage')
const { esTxFilters } = indyscanStorage

function initTxsApi (app, ledgerStorageManager, networkManager) {
  function getNetworkId (req, res) {
    const { networkRef } = req.params
    try {
      return networkManager.getNetworkId(networkRef)
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

  app.get('/networks/:networkRef/ledgers/:ledger/txs',
    // validate(
    //   {
    //     query: {
    //       fromRecentTx: Joi.string().required(),
    //       toRecentTx: Joi.string().required(),
    //       filterTxNames: Joi.string().required(),
    //     }
    //   }
    // ),
    asyncHandler(async function (req, res) {
      const parts = url.parse(req.url, true)
      const networkId = getNetworkId(req, res)
      let { ledger } = req.params
      let { fromRecentTx, toRecentTx, filterTxNames } = parts.query
      let { skip, size } = getTxRange(fromRecentTx, toRecentTx)
      const txs = await ledgerStorageManager.getStorage(networkId, ledger).getTxs(skip, size, urlQueryTxNamesToEsQuery(filterTxNames))
      res.status(200).send({ txs })
    }))

  app.get('/networks/:networkRef/ledgers/:ledger/txs/:seqNo',
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
      const networkDbName = getNetworkId(req, res)
      let parsedSeqNo
      try {
        parsedSeqNo = parseInt(seqNo)
      } catch (e) {
        res.status(400).send({ message: `seqNo must be number` })
      }
      const storage = await ledgerStorageManager.getStorage(networkDbName, ledger)
      logger.info(`format = ${format}`)
      const tx = (format === 'original') ? await storage.getTxBySeqNo(parsedSeqNo) : await storage.getFullTxBySeqNo(parsedSeqNo)
      res.status(200).send(tx)
    }))

  app.get('/networks/:networkRef/ledgers/:ledger/txs/stats/count',
    validate(
      {
        query: {

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
