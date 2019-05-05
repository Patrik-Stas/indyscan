const { getOldestTransactions } = require('../service/service-txs')
const logger = require('../logging/logger-main')
const url = require('url')
const indyscanStorage = require('indyscan-storage')
const { txFilters, histogram } = indyscanStorage

function initTxsApi (router, ledgerStorageManager, networkManager) {
  router.get('/networks/:networkRef/ledgers/:ledger/txs', async (req, res) => {
    logger.info(`API HIT Get all txs: ${req.url}`)
    const parts = url.parse(req.url, true)
    let { networkRef, ledger } = req.params
    const fromRecentTx = parseInt(parts.query.fromRecentTx)
    const toRecentTx = parseInt(parts.query.toRecentTx)
    const filterTxNames = (parts.query.filterTxNames) ? JSON.parse(parts.query.filterTxNames) : []
    if (!(fromRecentTx >= 0 && toRecentTx >= 0 && toRecentTx - fromRecentTx < 150 && toRecentTx - fromRecentTx > 0)) {
      logger.info(`Query string failed validation checks.`)
      res.status(400).send({ message: 'i don\'t like your query string' })
      return
    }
    let networkDbName
    try {
      networkDbName = networkManager.getDbName(networkRef)
    } catch (err) {
      return res.status(404).send({ message: `Couldn't resolve network you are referencing (${networkRef})` })
    }
    const txFilter = txFilters.filterByTxTypeNames(filterTxNames)
    const limit = toRecentTx - fromRecentTx
    const txs = await ledgerStorageManager.getLedger(networkDbName, ledger).getTxs(fromRecentTx, limit, txFilter)
    res.status(200).send({ txs })
  })

  router.get('/networks/:networkRef/txs/stats', async (req, res) => {
    logger.info(`API HIT Get network stats: ${req.url}`)
    const { networkRef } = req.params
    const parts = url.parse(req.url, true)
    let queryType = parts.query.type
    if (queryType === 'oldestTxnTime') {
      const oldestTxnTime = await getOldestTransactions(ledgerStorageManager, networkRef)
      return res.status(200).send({ oldestTxnTime })
    }
    return res.status(400).send()
  })

  router.get('/networks/:networkRef/ledgers/:ledger/txs/stats/series', async (req, res) => {
    logger.info(`API HIT Get series: ${req.url}`)
    const { networkRef, ledger } = req.params
    const parts = url.parse(req.url, true)
    const secsInDay = 3600 * 24
    logger.info(JSON.stringify(parts.query))
    let intervalSec = (!parts.query.intervalSec)
      ? (secsInDay * 7)
      : Math.max(parseInt(parts.query.intervalSec), 30)
    let networkDbName
    try {
      networkDbName = networkManager.getDbName(networkRef)
    } catch (err) {
      return res.status(404).send({ message: `Couldn't resolve network you are referencing (${networkRef})` })
    }
    logger.info(`Get timestamps...`)
    const timestampsSec = await ledgerStorageManager.getLedger(networkDbName, ledger).getTxsTimestamps()
    // logger.info(`Timestamps= ${JSON.stringify(timestampsSec)}`)
    logger.info(`Get oldest...`)
    const since = parseInt(parts.query.since) || await getOldestTransactions(ledgerStorageManager, networkRef)
    const until = parseInt(parts.query.until) || Math.floor(new Date() / 1000)
    logger.info(`Series since=${since}, until=${until} interval=${intervalSec}`)
    logger.info(`Create historgram..`)
    const histogramData = await histogram.createHistogramInRange(timestampsSec, intervalSec, since, until)
    // logger.info(`Histogram: ${JSON.stringify(histogramData)}`)
    res.status(200).send(histogramData)
  })

  router.get('/networks/:networkRef/ledgers/:ledger/txs/:seqNo', async (req, res) => {
    logger.info(`API HIT Get transactions by seqno: ${req.url}`)
    let { networkRef, ledger, seqNo } = req.params
    let networkDbName
    try {
      networkDbName = networkManager.getDbName(networkRef)
    } catch (err) {
      return res.status(404).send({ message: `Couldn't resolve network you are referencing (${networkRef})` })
    }
    logger.info(`Fetching transaciton from DB. Search: ${networkDbName} and ledger ${ledger}`)
    const tx = await ledgerStorageManager.getLedger(networkDbName, ledger).getTxBySeqNo(parseInt(seqNo))
    logger.info(JSON.stringify(tx))
    res.status(200).send(tx)
  })

  router.get('/networks/:networkRef/ledgers/:ledger/txs/stats/count', async (req, res) => {
    logger.info(`API HIT Get network/ledger stats: ${req.url}`)
    const parts = url.parse(req.url, true)
    const ledger = parts.query.ledger
    const queryNetworkRef = parts.query.network
    let networkDbName
    try {
      networkDbName = networkManager.getDbName(queryNetworkRef)
    } catch (err) {
      return res.status(404).send({ message: `Couldn't resolve network you are referencing (${queryNetworkRef})` })
    }
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
