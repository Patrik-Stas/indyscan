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

  function calculateBucketSizeSec (sinceUtimeSec, untilUtimeSec) {
    const rangeSizeSec = Math.abs(untilUtimeSec - sinceUtimeSec)
    return Math.max(rangeSizeSec / 120, 1800)
  }

  router.get('/networks/:networkRef/ledgers/:ledger/txs/stats/series', async (req, res) => {
    const { ledger } = req.params
    const parts = url.parse(req.url, true)
    const networkDbName = getNetworkDbName(req, res)
    const timestampsSec = await ledgerStorageManager.getLedger(networkDbName, ledger).getTxsTimestamps()
    let since
    if (parts.query.since) {
      if (parts.query.since === 'Infinity' || parts.query.since === '-Infinity') {
        since = await getOldestTransactions(ledgerStorageManager, networkDbName)
        logger.debug(`The oldest transaction is =${since}`)
      } else {
        try {
          since = parseInt(parts.query.since)
        } catch (err) {
          return res.status(400).send({ message: "The 'since' query parameter is not valid integer." })
        }
      }
    } else {
      since = await getOldestTransactions(ledgerStorageManager, networkDbName)
    }
    let until
    if (parts.query.until) {
      try {
        until = parseInt(parts.query.until)
      } catch (err) {
        return res.status(400).send({ message: "The 'since' query parameter is not valid integer." })
      }
    } else {
      until = Math.floor(new Date() / 1000)
    }
    logger.info(`Will use: since=${since} until=${until}`)
    let intervalSec
    const minIntervalSizeSec = 1800
    if (!parts.query.intervalSec || parts.query.intervalSec === 'auto') {
      intervalSec = calculateBucketSizeSec(since, until)
    } else {
      try {
        intervalSec = parseInt(parts.query.intervalSec)
        intervalSec = (intervalSec < minIntervalSizeSec) ? intervalSec : minIntervalSizeSec
      } catch (err) {
        return res.status(400).send({ message: "The 'intervalSec' query parameter is not valid integer." })
      }
    }
    console.log(`Will calcualte series data for length of ${(until-since) / (3600 * 24)} days`)
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
