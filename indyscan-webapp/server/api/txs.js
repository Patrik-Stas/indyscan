const { getOldestTransactions } = require('../service/service-txs')
const logger = require('../logging/logger-main')
const url = require('url')
const indyscanStorage = require('indyscan-storage')
const { txFilters, histogram } = indyscanStorage

function initTxsApi (router, ledgerStorageManager, networkManager) {
  function getNetworkDbName (req, res) {
    const { networkRef } = req.params
    try {
      const dbName = networkManager.getDbName(networkRef)
      logger.info(`Resolved network reference=${networkRef} to dbName=${dbName}`)
      return dbName
    } catch (err) {
      return res.status(404).send({ message: `Couldn't resolve network you are referencing (${networkRef})` })
    }
  }

  router.get('/networks/:networkRef/ledgers/:ledger/txs', async (req, res) => {
    const parts = url.parse(req.url, true)
    const networkDbName = getNetworkDbName(req, res)
    let { ledger } = req.params
    const fromRecentTx = parseInt(parts.query.fromRecentTx)
    const toRecentTx = parseInt(parts.query.toRecentTx)
    const filterTxNames = (parts.query.filterTxNames) ? JSON.parse(parts.query.filterTxNames) : []
    if (!(fromRecentTx >= 0 && toRecentTx >= 0 && toRecentTx - fromRecentTx < 150 && toRecentTx - fromRecentTx > 0)) {
      logger.info(`Query string failed validation checks.`)
      res.status(400).send({ message: 'i don\'t like your query string' })
      return
    }
    const txFilter = txFilters.filterByTxTypeNames(filterTxNames)
    const limit = toRecentTx - fromRecentTx
    const txs = await ledgerStorageManager.getLedger(networkDbName, ledger).getTxs(fromRecentTx, limit, txFilter)
    res.status(200).send({ txs })
  })

  router.get('/networks/:networkRef/txs/stats', async (req, res) => {
    const networkDbName = getNetworkDbName(req, res)
    const parts = url.parse(req.url, true)
    let queryType = parts.query.type
    if (queryType === 'oldestTxnTime') {
      const oldestTxnTime = await getOldestTransactions(ledgerStorageManager, networkDbName)
      return res.status(200).send({ oldestTxnTime })
    }
    return res.status(400).send()
  })

  router.get('/networks/:networkRef/ledgers/:ledger/txs/stats/series', async (req, res) => {
    const { ledger } = req.params
    const parts = url.parse(req.url, true)
    const secsInDay = 3600 * 24
    logger.info(JSON.stringify(parts.query))
    let intervalSec = (!parts.query.intervalSec)
      ? (secsInDay * 7)
      : Math.max(parseInt(parts.query.intervalSec), 30)
    const networkDbName = getNetworkDbName(req, res)
    const timestampsSec = await ledgerStorageManager.getLedger(networkDbName, ledger).getTxsTimestamps()
    const since = parseInt(parts.query.since) || await getOldestTransactions(ledgerStorageManager, networkDbName)
    const until = parseInt(parts.query.until) || Math.floor(new Date() / 1000)
    const histogramData = await histogram.createHistogramInRange(timestampsSec, intervalSec, since, until)
    res.status(200).send(histogramData)
  })

  router.get('/networks/:networkRef/ledgers/:ledger/txs/:seqNo', async (req, res) => {
    let { ledger, seqNo } = req.params
    const networkDbName = getNetworkDbName(req, res)
    let parsedSeqNo
    try {
      parsedSeqNo = parseInt(seqNo)
    } catch (e) {
      res.status(400).send({ message: `seqNo must be number` })
    }
    const tx = await ledgerStorageManager.getLedger(networkDbName, ledger).getTxBySeqNo(parsedSeqNo)
    logger.info(JSON.stringify(tx))
    res.status(200).send(tx)
  })

  router.get('/networks/:networkRef/ledgers/:ledger/txs/stats/count', async (req, res) => {
    const parts = url.parse(req.url, true)
    const { ledger } = req.params
    const networkDbName = getNetworkDbName(req, res)
    const filterTxNames = (parts.query.filterTxNames) ? JSON.parse(parts.query.filterTxNames) : []
    const txFilter = txFilters.filterByTxTypeNames(filterTxNames)
    const txCount = await ledgerStorageManager.getLedger(networkDbName, ledger).getTxCount(txFilter)
    res.status(200).send({ txCount })
  })

  // router.get('/networks/:networkRef/txs/count', async (req, res) => {
  //   res.status(200).send({})
  // })
  //
  // router.get('/networks/:networkRef/txs', async (req, res) => {
  //   res.status(200).send({})
  // })

  return router
}

module.exports = initTxsApi
