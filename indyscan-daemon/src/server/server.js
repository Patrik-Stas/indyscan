const { envConfig } = require('../config/env')
const apiWorkers = require('./api/api-workers')
const express = require('express')
const bodyParser = require('body-parser')
const logger = require('../logging/logger-main')
var pretty = require('express-prettify')
const { logRequests, logResponses } = require('./middleware')
const socketio = require('socket.io')

function setupLoggingMiddlleware (app, enableRequestLogging, enableResponseLogging) {
  if (enableRequestLogging) {
    app.use(logRequests)
  }
  if (enableResponseLogging) {
    app.use(logResponses)
  }
}

function linkEmitterToSocket(io, emitter, indyNetworkId, subledger) {
  logger.info(`Linking worker emitter to websockets. indyNetworkId=${indyNetworkId} subledger=${subledger}, `)
  let namespace = indyNetworkId
  let nsp = io.of(`/${namespace}`)

  nsp.on('connection', function (_socket) {
    logger.info(`New connection at namespace /${namespace}`)
  })

  emitter.on('tx-processed', ({workerData, txData}) => {
    const payload = { workerData, txData }
    const websocketEvent = 'tx-processed'
    logger.debug(`Namespace "${namespace}" broadcasting "${websocketEvent}" with payload: ${JSON.stringify(payload)}.`)
    nsp.emit(websocketEvent, payload)
  })

  emitter.on('rescan-scheduled', ({workerData, msTillRescan}) => {
    const payload = { workerData, msTillRescan }
    const websocketEvent = "rescan-scheduled"
    logger.debug(`Namespace "${namespace}" broadcasting "${websocketEvent}" with payload: ${JSON.stringify(payload)}.`)
    nsp.emit(websocketEvent, payload)
  })
}

function startServer (serviceWorkers) {
  logger.info('Starting daemon express server!')
  const app = express()
  app.use(bodyParser.json())
  app.use(pretty({ query: 'pretty' }))

  setupLoggingMiddlleware(app, envConfig.LOG_HTTP_REQUESTS === 'true', envConfig.LOG_HTTP_RESPONSES === 'true')

  apiWorkers(app, serviceWorkers)
  let server = app.listen(envConfig.SERVER_PORT, () => logger.info(`Daemon server started at port ${envConfig.SERVER_PORT}!`))

  let io = socketio(server)

  io.on('connection', function (socket) {
    logger.info(`New websocket connection!`)
  })

  let workers = serviceWorkers.getWorkers()

  for (const worker of workers) {
    const emitter = worker.getEventEmitter()
    const { subledger, operationType, indyNetworkId } = worker.getWorkerInfo()
    if (operationType === 'expansion') {
      linkEmitterToSocket(io, emitter, indyNetworkId, subledger)
    }
  }
}

module.exports.startServer = startServer
