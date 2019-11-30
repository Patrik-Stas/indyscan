const logger = require('./logging/logger-main')
const {appConfig, networksConfig} = require('./config')
const express = require('express')
const next = require('next')

const { logRequests, logResponses } = require('./middleware')
const {createNetworkManager} = require('./service/service-networks')
const initApiTxs = require('./api/txs.js')
const initApiNetworks = require('./api/networks.js')
const {createLedgerStorageManager} = require('./service/service-storages')


function setupNetworkManager(networkConfigs) {
  const networkConfigManager = createNetworkManager()
  for (const networkConfig of networkConfigs) {
    try {
      networkConfigManager.addNetworkConfig(networkConfig)
    } catch (err) {
      logger.error(`Problem with network config ${JSON.stringify(networkConfig)}. Error: ${err.message} ${err.stack}`)
    }
  }
  return networkConfigManager
}

async function setupStorageManager(networkConfigManager, esUrl) {
  const ledgerStorageManager = await createLedgerStorageManager(esUrl)
  const storagePromises = []
  for (const networkConfig of networkConfigManager.getNetworkConfigs()) {
    let storagePromise = ledgerStorageManager.addIndyNetwork(networkConfig.id, networkConfig.es.index)
      .catch(err => {
        logger.error(`Problem creating network storage manager for ${JSON.stringify(networkConfig.id)}. ` +
          `Error: ${err.message} ${err.stack}`)
      })
    storagePromises.push(storagePromise)
  }
  await Promise.all(storagePromises)
  return ledgerStorageManager
}

function setupLoggingMiddlleware (app, enableRequestLogging, enableResponseLogging) {
  if (enableRequestLogging) {
    app.use(logRequests)
  }
  if (enableResponseLogging) {
    app.use(logResponses)
  }
}

async function startServer () {
  const networkConfigManager = setupNetworkManager(networksConfig)
  const ledgerStorageManager = await setupStorageManager(networkConfigManager, appConfig.ES_URL)

  const app = next({dev: process.env.NODE_ENV !== 'production'})
  const handle = app.getRequestHandler()

  app
    .prepare()
    .then(() => {
      const server = express()
      const apiRouter = express.Router()
      initApiTxs(apiRouter, ledgerStorageManager, networkConfigManager)
      initApiNetworks(apiRouter, networkConfigManager)

      setupLoggingMiddlleware(server, appConfig.LOG_HTTP_REQUESTS === 'true', appConfig.LOG_HTTP_RESPONSES === 'true')

      server.use('/api', apiRouter)

      server.get('/', (req, res) => {
        logger.info('GET /')
        res.redirect(`/home/${networkConfigManager.getDefaultNetworkId()}`)
      })

      server.get('/home', (req, res) => {
        logger.info('GET /home')
        res.redirect(`/home/${networkConfigManager.getDefaultNetworkId()}`)
      })

      server.get('/version', (req, res) => {
        require('pkginfo')(module)
        return res.status(200).send({version: module.exports.version})
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

      server.listen(appConfig.PORT, err => {
        if (err) throw err
        logger.info(`> Ready on ${appConfig.PORT}`)
      })
    })
    .catch(ex => {
      logger.error(ex.stack)
      process.exit(1)
    })
}

startServer()
