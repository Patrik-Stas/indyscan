const logger = require('../logging/logger-main')
const url = require('url')
const indyscanStorage = require('indyscan-storage')
const { esTxFilters } = indyscanStorage

function initTxsApi (router, ledgerStorageManager, networkManager) {
  function getNetworkId (req, res) {
    const { networkRef } = req.params
    try {
      return networkManager.getNetworkId(networkRef)
    } catch (err) {
      return res.status(404).send({ message: `Couldn't resolve network you are referencing (${networkRef})` })
    }
  }

  router.get('/networks/:networkRef/ledgers/:ledger/txs', async (req, res) => {
    const parts = url.parse(req.url, true)
    const networkDbName = getNetworkId(req, res)
    let { ledger } = req.params
    const fromRecentTx = parseInt(parts.query.fromRecentTx)
    const toRecentTx = parseInt(parts.query.toRecentTx)
    const filterTxNames = (parts.query.filterTxNames) ? JSON.parse(parts.query.filterTxNames) : []
    if (!(fromRecentTx >= 0 && toRecentTx >= 0 && toRecentTx - fromRecentTx < 150 && toRecentTx - fromRecentTx > 0)) {
      logger.info(`Query string failed validation checks.`)
      res.status(400).send({ message: 'i don\'t like your query string' })
      return
    }
    const query = esTxFilters.esFilterByTxTypeNames(filterTxNames)
    const limit = toRecentTx - fromRecentTx
    const txs = await ledgerStorageManager.getStorage(networkDbName, ledger).getTxs(fromRecentTx, limit, query)
    res.status(200).send({ txs })
  })

  router.get('/networks/:networkRef/ledgers/:ledger/txs/:seqNo', async (req, res) => {
    let { ledger, seqNo } = req.params
    const networkDbName = getNetworkId(req, res)
    let parsedSeqNo
    try {
      parsedSeqNo = parseInt(seqNo)
    } catch (e) {
      res.status(400).send({ message: `seqNo must be number` })
    }
    const tx = await ledgerStorageManager.getStorage(networkDbName, ledger).getTxBySeqNo(parsedSeqNo)
    logger.info(JSON.stringify(tx))
    res.status(200).send(tx)
  })

  return router
}

module.exports = initTxsApi
