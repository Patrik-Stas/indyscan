const createHistogram = require('../../services/timeseries')
const queryString = require('query-string')
const url = require('url')
const express = require('express')
const indyStorage = require('indyscan-storage')
const { getIndyNetworks, getDefaultNetwork } = require('../networks')

function initTxsApi (router, storageManager) {
  router.get('/txs/count', async (req, res) => {
    const parts = url.parse(req.url, true)
    const network = parts.query.network
    const txType = parts.query.txType

    console.log(`API GET ${req.url}`)
    const txCount = await storageManager.getTxCollection(network, txType).getTxCount()
    res.status(200).send({ txCount })
  })

  router.get('/txs', async (req, res) => {
    const parts = url.parse(req.url, true)
    const fromRecentTx = parseInt(parts.query.fromRecentTx)
    const toRecentTx = parseInt(parts.query.toRecentTx)
    const network = parts.query.network
    const txType = parts.query.txType

    console.log(`API GET ${req.url}`)
    // console.log(`Query parameters: ${JSON.stringify(parts)}`);
    if (!(fromRecentTx >= 0 && toRecentTx >= 0 && toRecentTx - fromRecentTx < 150 && toRecentTx - fromRecentTx > 0)) {
      console.log(`Query string failed validation checks.`)
      res.status(400).send({ message: "i don't like your query string" })
      return
    }
    const txs = await storageManager.getTxCollection(network, txType).getTxRange(fromRecentTx, toRecentTx - fromRecentTx)
    res.status(200).send({ txs })
  })

  router.get('/tx', async (req, res) => {
    const parts = url.parse(req.url, true)
    const seqNo = parseInt(parts.query.seqNo)
    const network = parts.query.network
    const txType = parts.query.txType

    console.log(`API GET ${req.url}`)
    const tx = await storageManager.getTxCollection(network, txType).getTxBySeqNo(seqNo)
    console.log(JSON.stringify(tx))
    res.status(200).send(tx)
  })

  const oneDayInMiliseconds = 1000 * 60 * 60 * 24

  router.get('/txs-timeseries', async (req, res) => {
    const parts = url.parse(req.url, true)
    const network = parts.query.network
    const txType = parts.query.txType
    console.log(`API GET  ${req.url}`)
    const timestamps = await storageManager.getTxCollection(network, txType).getAllTimestamps()
    const histogram = await createHistogram(timestamps, oneDayInMiliseconds)
    res.status(200).send({ histogram })
  })

  return router
}

module.exports = initTxsApi
