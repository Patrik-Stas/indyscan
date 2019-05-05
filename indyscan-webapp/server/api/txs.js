
const url = require('url')
const indyscanStorage = require('indyscan-storage')
const { txFilters, histogram } = indyscanStorage

function initTxsApi (router, ledgerStorageManager, networkManager) {
  router.get('/networks/:networkRef/ledgers/:ledger/txs', async (req, res) => {
    const parts = url.parse(req.url, true)
    let { networkRef, ledger } = req.params
    const fromRecentTx = parseInt(parts.query.fromRecentTx)
    const toRecentTx = parseInt(parts.query.toRecentTx)
    const filterTxNames = (parts.query.filterTxNames) ? JSON.parse(parts.query.filterTxNames) : []
    if (!(fromRecentTx >= 0 && toRecentTx >= 0 && toRecentTx - fromRecentTx < 150 && toRecentTx - fromRecentTx > 0)) {
      console.log(`Query string failed validation checks.`)
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
    console.log(`Oldest txs????`)
    const { networkRef } = req.params
    const parts = url.parse(req.url, true)
    let queryType = parts.query.type
    if (queryType === 'oldestTxnTime') {
      const domain = await ledgerStorageManager.getLedger(networkRef, 'domain').getOldestTimestamp()
      const pool = await ledgerStorageManager.getLedger(networkRef, 'pool').getOldestTimestamp()
      const config = await ledgerStorageManager.getLedger(networkRef, 'config').getOldestTimestamp()
      const txsTimes = [domain, pool, config].filter(m => m != null)
      if (txsTimes.length > 0) {
        return res.status(200).send({ oldestTxnTime: Math.min(...txsTimes) })
      }
      return res.status(200).send({ oldestTxnTime: null })
    }
    return res.status(400).send()
  })

  router.get('/networks/:networkRef/ledgers/:ledger/txs/series', async (req, res) => {
    const { networkRef, ledger } = req.params
    const parts = url.parse(req.url, true)
    const secsInDay = 3600 * 24
    let intervalSec = parts.query.intervalSecs || (secsInDay * 7)
    intervalSec = (intervalSec < 30) ? 30 : intervalSec
    let networkDbName
    try {
      networkDbName = networkManager.getDbName(networkRef)
    } catch (err) {
      return res.status(404).send({ message: `Couldn't resolve network you are referencing (${networkRef})` })
    }
    console.log(`gettiing series for network ${networkDbName} and ledger ${ledger}`)
    const timestampsSec = await ledgerStorageManager.getLedger(networkDbName, ledger).getTxsTimestamps()
    // const minutesRange = utimeDifference(Math.min(...timestampsMs), Math.max(...timestampsMs), 'minutes')
    console.log(`Bucket size in seconds is = ${intervalSec}`)
    const histogramData = await histogram.createHistogram(timestampsSec, intervalSec)
    res.status(200).send(histogramData)
  })

  router.get('/networks/:networkRef/ledgers/:ledger/txs/count', async (req, res) => {
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

  router.get('/networks/:networkRef/ledgers/:ledger/txs/:seqNo', async (req, res) => {
    console.log(`get by seqno`)
    let { networkRef, ledger, seqNo } = req.params
    let networkDbName
    try {
      networkDbName = networkManager.getDbName(networkRef)
    } catch (err) {
      return res.status(404).send({ message: `Couldn't resolve network you are referencing (${networkRef})` })
    }
    const tx = await ledgerStorageManager.getLedger(networkDbName, ledger).getTxBySeqNo(seqNo)
    console.log(JSON.stringify(tx))
    res.status(200).send(tx)
  })

  const oneDayInMiliseconds = 1000 * 60 * 60 * 24

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
