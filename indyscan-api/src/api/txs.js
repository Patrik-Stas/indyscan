const { asyncHandler } = require('../middleware')
const validate = require('express-validation')
const Joi = require('joi')
const url = require('url')

function initTxsApi (app, networkManager, serviceTxs) {
  function getNetworkId (req, res) {
    const { networkRef } = req.params
    try {
      return networkManager.getNetworkConfig(networkRef).id
    } catch (err) {
      return res.status(404).send({ message: `Couldn't resolve network you are referencing (${networkRef})` })
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
          format: Joi.string().valid(['original', 'full', 'indyscan'])
        }
      }
    ),
    asyncHandler(async function (req, res) {
      const parts = url.parse(req.url, true)
      const networkId = getNetworkId(req, res)
      let { ledger } = req.params
      let { skip, size, filterTxNames, search, format, sortFromRecent } = parts.query
      const txs = await serviceTxs.getTxs(
        networkId,
        ledger,
        skip || 0,
        size || 50,
        filterTxNames,
        search,
        format,
        sortFromRecent
      )
      res.status(200).send(txs)
    }))

  app.get('/api/networks/:networkRef/ledgers/:ledger/txs/:seqNo',
    validate(
      {
        query: {
          format: Joi.string().valid(['original', 'full', 'indyscan'])
        }
      }
    ),
    asyncHandler(async function (req, res) {
      let { ledger: subledger, seqNo } = req.params
      let { format } = req.query
      format = format || 'full'
      const networkId = getNetworkId(req, res)
      let tx = await serviceTxs.getTx(networkId, subledger, parseInt(seqNo), format)
      res.status(200).send(tx)
    }))

  app.get('/api/networks/:networkRef/ledgers/:ledger/txs/stats/count',
    validate(
      {
        query: {
          filterTxNames: Joi.array().items(Joi.string()).required()
        }
      }
    ),
    asyncHandler(async function (req, res) {
      const parts = url.parse(req.url, true)
      const { ledger } = req.params
      const networkId = getNetworkId(req, res)
      const { filterTxNames, search } = parts.query
      const txCount = serviceTxs.getTxsCount(networkId, ledger, filterTxNames, search)
      res.status(200).send({ txCount })
    }))

  return app
}

module.exports = initTxsApi
