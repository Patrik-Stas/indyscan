const createHistogram = require('../../services/timeseries')
const url = require('url')

function initTxsApi (router, ledgerStorageManager) {
  router.get('/txs', async (req, res) => {
    const parts = url.parse(req.url, true)
    const fromRecentTx = parseInt(parts.query.fromRecentTx)
    const toRecentTx = parseInt(parts.query.toRecentTx)
    const network = parts.query.network
    const ledger = parts.query.ledger
    // const filter = parts.query.filter

    if (!(fromRecentTx >= 0 && toRecentTx >= 0 && toRecentTx - fromRecentTx < 150 && toRecentTx - fromRecentTx > 0)) {
      console.log(`Query string failed validation checks.`)
      res.status(400).send({ message: 'i don\'t like your query string' })
      return
    }
    const txs = await ledgerStorageManager.getLedger(network, ledger).getTxRange(fromRecentTx, toRecentTx - fromRecentTx)
    res.status(200).send({ txs })
  })

  router.get('/txs/:seqNo', async (req, res) => {
    const parts = url.parse(req.url, true)
    const seqNo = parseInt(req.params.seqNo)
    const network = parts.query.network
    const ledger = parts.query.ledger

    console.log(`API GET ${req.url}`)
    const tx = await ledgerStorageManager.getLedger(network, ledger).getTxBySeqNo(seqNo)
    console.log(JSON.stringify(tx))
    res.status(200).send(tx)
  })

  const oneDayInMiliseconds = 1000 * 60 * 60 * 24

  router.get('/txs/stats/series', async (req, res) => {
    const parts = url.parse(req.url, true)
    const network = parts.query.network
    const ledger = parts.query.txType
    console.log(`API GET  ${req.url}`)
    const timestamps = await ledgerStorageManager.getLedger(network, ledger).getAllTimestamps()
    const histogram = await createHistogram(timestamps, oneDayInMiliseconds)
    res.status(200).send({ histogram })
  })

  router.get('/txs/stats/count', async (req, res) => {
    const parts = url.parse(req.url, true)
    const network = parts.query.network
    const ledger = parts.query.txType

    console.log(`API GET ${req.url}`)
    const txCount = await ledgerStorageManager.getLedger(network, ledger).getTxCount()
    res.status(200).send({ txCount })
  })

  return router
}

module.exports = initTxsApi
