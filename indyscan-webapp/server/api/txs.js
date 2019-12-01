const logger = require('../logging/logger-main')
const url = require('url')
const indyscanStorage = require('indyscan-storage')
const {esTxFilters} = indyscanStorage

function initTxsApi (router, ledgerStorageManager, networkManager) {
  function getNetworkId (req, res) {
    const {networkRef} = req.params
    try {
      return networkManager.getNetworkId(networkRef)
    } catch (err) {
      return res.status(404).send({message: `Couldn't resolve network you are referencing (${networkRef})`})
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

  router.get('/networks/:networkRef/ledgers/:ledger/txs', async (req, res) => {
    const parts = url.parse(req.url, true)
    const networkId = getNetworkId(req, res)
    let {ledger} = req.params
    let {fromRecentTx, toRecentTx, filterTxNames} = parts.query
    let {skip, size} = getTxRange(fromRecentTx, toRecentTx)
    const txs = await ledgerStorageManager.getStorage(networkId, ledger).getTxs(skip, size, urlQueryTxNamesToEsQuery(filterTxNames))
    res.status(200).send({txs})
  })

  router.get('/networks/:networkRef/ledgers/:ledger/txs/:seqNo', async (req, res) => {
    let {ledger, seqNo} = req.params
    const networkDbName = getNetworkId(req, res)
    let parsedSeqNo
    try {
      parsedSeqNo = parseInt(seqNo)
    } catch (e) {
      res.status(400).send({message: `seqNo must be number`})
    }
    const tx = await ledgerStorageManager.getStorage(networkDbName, ledger).getTxBySeqNo(parsedSeqNo)
    logger.info(JSON.stringify(tx))
    res.status(200).send(tx)
  })

  router.get('/networks/:networkRef/ledgers/:ledger/txs/stats/count', async (req, res) => {
    const parts = url.parse(req.url, true)
    const { ledger } = req.params
    const networkId = getNetworkId(req, res)
    const {filterTxNames} = parts.query
    const txCount = await ledgerStorageManager.getStorage(networkId, ledger).getTxCount(urlQueryTxNamesToEsQuery(filterTxNames))
    res.status(200).send({ txCount })
  })

  return router
}

module.exports = initTxsApi
