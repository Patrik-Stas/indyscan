const { createNetworkManager } = require('./networkManager')
const express = require('express')
const next = require('next')
const initApiTxs = require('./api/txs.js')
const initApiNetworks = require('./api/networks.js')
const { createLedgerStorageManager } = require('indyscan-storage')
const { loadV1Config, loadV2Config } = require('./config')
const logger = require('./logging/logger-main')
const url = require('url')

function loadConfig () {
  if (process.env.INDY_NETWORKS_V2) {
    return loadV2Config(process.env.INDY_NETWORKS_V2)
  } else if (process.env.INDY_NETWORKS) {
    return loadV1Config(process.env.INDY_NETWORKS)
  } else {
    throw Error(`Found no indy network configuration. Use INDY_NETWORKS and INDY_NETWORKS_V2 env variables to supply.`)
  }
}

const networkConfig = loadConfig()
const networkManager = createNetworkManager(networkConfig)

logger.info(`Running indyscan webapp against following mongo databases: ${JSON.stringify(networkManager.getNetworkDbs())}`)
logger.info(`Default network is id='${networkManager.getDefaultNetworkId()}'`)

const URL_MONGO = process.env.URL_MONGO || 'mongodb://localhost:27017'
logger.info(`Connecting to Mongo URL: ${URL_MONGO}`)

const PORT = process.env.WEBAPP_PORT || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

async function startServer () {
  const ledgerStorageManager = await createLedgerStorageManager(URL_MONGO)
  for (const network of networkManager.getNetworkDbs()) {
    logger.debug(`Adding network '${network}' to ledger storage manager.`)
    await ledgerStorageManager.addIndyNetwork(network)
  }

  app
    .prepare()
    .then(() => {
      const server = express()
      const apiRouter = express.Router()
      initApiTxs(apiRouter, ledgerStorageManager, networkManager)
      initApiNetworks(apiRouter, networkManager)

      server.use('/api/*', function (req, res, next) {
        logger.debug(`----> Request: [${req.method}] ${req.originalUrl}`)
        logger.debug(`----> Query: ${JSON.stringify(req.query)}`)
        const parts = url.parse(req.url, true)
        logger.info(`Url query parts: ${JSON.stringify(parts.query)}`)
        next()
      })

      server.use('/api', apiRouter)

      server.get('/', (req, res) => {
        logger.debug(`ROOT URL: /`)
        res.redirect(`/home/${networkManager.getDefaultNetworkId()}`)
      })

      server.get('/version', (req, res) => {
        require('pkginfo')(module)
        return res.status(200).send({ version: module.exports.version })
      })

      server.get('/home', (req, res) => {
        logger.debug(`ROOT URL: /`)
        res.redirect(`/home/${networkManager.getDefaultNetworkId()}`)
      })

      server.get('/home/:network', (req, res) => {
        const mergedQuery = Object.assign({}, req.query, req.params)
        logger.debug(`Custom express routing handler: /home/:network\nmerged query: ${JSON.stringify(mergedQuery)}`)
        return app.render(req, res, '/home', mergedQuery)
      })

      server.get('/txs/:network/:ledger', (req, res) => {
        const mergedQuery = Object.assign({}, req.query, req.params)
        logger.debug(`Custom express routing handler: /txs/:network/:ledger\nmerged query: ${JSON.stringify(mergedQuery)}`)
        return app.render(req, res, '/txs', mergedQuery)
      })

      server.get('/tx/:network/:ledger/:seqNo', (req, res) => {
        const mergedQuery = Object.assign({}, req.query, req.params)
        logger.debug(`Custom express routing handler: /txs/:network/:ledger\nmerged query: ${JSON.stringify(mergedQuery)}`)
        return app.render(req, res, '/tx', mergedQuery)
      })

      server.get('*', (req, res) => {
        return handle(req, res)
      })

      server.listen(PORT, err => {
        if (err) throw err
        logger.info(`> Ready on ${PORT}`)
      })
    })
    .catch(ex => {
      logger.error(ex.stack)
      process.exit(1)
    })
}

startServer()
