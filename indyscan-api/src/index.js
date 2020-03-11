const logger = require('./logging/logger-main')
const { appConfig, networksConfig } = require('./config')
const { logRequests, logResponses } = require('./middleware')
const initApiTxs = require('../../indyscan-api/src/api/txs.js')
const initApiNetworks = require('../../indyscan-api/src/api/networks.js')
const { createLedgerStorageManager } = require('./service/service-storages')
const { createNetworkManager } = require('./service/service-networks')
const express = require('express')

const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())
var pretty = require('express-prettify')
const { createServiceTxs } = require('./service/service-txs')
app.use(pretty({ query: 'pretty' }))

function setupLoggingMiddlleware (app, enableRequestLogging, enableResponseLogging) {
  if (enableRequestLogging) {
    app.use(logRequests)
  }
  if (enableResponseLogging) {
    app.use(logResponses)
  }
}

function setupNetworkManager (networkConfigs) {
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

async function setupStorageManager (networkConfigManager, esUrl) {
  const ledgerStorageManager = await createLedgerStorageManager(esUrl)
  for (const networkConfig of networkConfigManager.getNetworkConfigs()) {
    await ledgerStorageManager.addIndyNetwork(networkConfig.id, networkConfig.es.index)
  }
  return ledgerStorageManager
}

async function startServer () {
  const networkConfigManager = setupNetworkManager(networksConfig)
  const ledgerStorageManager = await setupStorageManager(networkConfigManager, appConfig.ES_URL)
  const serviceTxs = createServiceTxs(ledgerStorageManager)
  setupLoggingMiddlleware(app, appConfig.LOG_HTTP_REQUESTS === 'true', appConfig.LOG_HTTP_RESPONSES === 'true')
  initApiTxs(app, networkConfigManager, serviceTxs)
  initApiNetworks(app, networkConfigManager)

  app.use(function (err, req, res, next) {
    res.status(400).json(err)
  })

  app.use(function (req, res, next) {
    res.status(404).send({ message: `Your request: '${req.originalUrl}' didn't reach any handler.` })
  })

  app.listen(appConfig.PORT, err => {
    if (err) throw err
    logger.info(`> Ready on ${appConfig.PORT}`)
  })
}

startServer()
