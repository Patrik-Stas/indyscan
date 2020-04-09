const { envConfig } = require('../config/env')
const apiWorkers = require('./api/api-workers')
const express = require('express')
const bodyParser = require('body-parser')
const logger = require('../logging/logger-main')
var pretty = require('express-prettify')
const { createSocketioManager } = require('./wsockets')
const { logRequests, logResponses } = require('./middleware')

function setupLoggingMiddlleware (app, enableRequestLogging, enableResponseLogging) {
  if (enableRequestLogging) {
    app.use(logRequests)
  }
  if (enableResponseLogging) {
    app.use(logResponses)
  }
}

function linkExpansionWorkersToSockets (socketioManager, serviceWorkers) {
  logger.info('Linking workers with sockets.')
  const workerQuery = { operationTypes: ['expansion'] }
  const workers = serviceWorkers.getWorkers(workerQuery)
  for (const worker of workers) {
    const emitter = worker.getEventEmitter()
    const { subledger, operationType, indyNetworkId } = worker.getWorkerInfo()
    logger.info(`Setting up event->ws forward for ${operationType}/${indyNetworkId}/${subledger} `)
    if (operationType === 'expansion') {
      socketioManager.forwardEmitterEventToWebsocket(emitter, 'tx-processed', indyNetworkId, subledger)
      socketioManager.forwardEmitterEventToWebsocket(emitter, 'rescan-scheduled', indyNetworkId, subledger)
    }
  }
}

function createRoomJoinReactor (serviceWorkers) {
  function onRoomJoined (room, socket) {
    const workerQuery = { operationTypes: ['expansion'], indyNetworkIds: [room] }
    const workers = serviceWorkers.getWorkers(workerQuery)
    for (const worker of workers) {
      const rescanScheduledPayload = worker.requestRescheduleStatus()
      socket.emit('rescan-scheduled', rescanScheduledPayload)
    }
  }
  return onRoomJoined
}

function setupWebsockets (expressServer, serviceWorkers) {
  const socketioManager = createSocketioManager(expressServer)
  socketioManager.setupBasicSocketioListeners(createRoomJoinReactor(serviceWorkers))
  linkExpansionWorkersToSockets(socketioManager, serviceWorkers)
}

function startServer (serviceWorkers) {
  logger.info('Starting daemon express server!')
  const app = express()
  app.use(bodyParser.json())
  app.use(pretty({ query: 'pretty' }))

  setupLoggingMiddlleware(app, envConfig.LOG_HTTP_REQUESTS === 'true', envConfig.LOG_HTTP_RESPONSES === 'true')

  apiWorkers(app, serviceWorkers)
  const server = app.listen(envConfig.SERVER_PORT, () => logger.info(`Daemon server started at port ${envConfig.SERVER_PORT}!`))
  setupWebsockets(server, serviceWorkers)
}

module.exports.startServer = startServer
