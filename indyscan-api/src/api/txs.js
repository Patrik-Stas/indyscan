const { asyncHandler } = require('../middleware')
const validate = require('express-validation')
const Joi = require('joi')

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
          format: Joi.string().valid(['serialized', 'full', 'expansion'])
        }
      }
    ),
    asyncHandler(async function (req, res) {
      const networkId = getNetworkId(req, res)
      const { ledger } = req.params
      console.log(JSON.stringify(req.query))
      const { skip, size, filterTxNames, search, format, sortFromRecent } = req.query
      const txs = await serviceTxs.getTxs(
        networkId,
        ledger,
        skip || 0,
        size || 50,
        filterTxNames,
        search,
        format,
        (sortFromRecent === undefined || sortFromRecent === null) ? true : (sortFromRecent === 'true')
      )
      res.status(200).send(txs)
    }))

  app.get('/api/networks/:networkRef/ledgers/:ledger/txs/:seqNo',
    validate(
      {
        query: {
          format: Joi.string().valid(['serialized', 'full', 'expansion'])
        }
      }
    ),
    asyncHandler(async function (req, res) {
      const { ledger: subledger, seqNo } = req.params
      let { format } = req.query
      format = format || 'full'
      const networkId = getNetworkId(req, res)
      const tx = await serviceTxs.getTx(networkId, subledger, parseInt(seqNo), format)
      res.status(200).send(tx)
    }))

  app.get('/api/networks/:networkRef/ledgers/:ledger/txs/stats/count',
    validate(
      {
        query: {
          filterTxNames: Joi.array().items(Joi.string())
        }
      }
    ),
    asyncHandler(async function (req, res) {
      const { ledger } = req.params
      const networkId = getNetworkId(req, res)
      const { filterTxNames, search } = req.query
      const txCount = await serviceTxs.getTxsCount(networkId, ledger, filterTxNames, search)
      res.status(200).send({ txCount })
    }))

  return app
}

module.exports = initTxsApi
