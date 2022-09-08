const { envConfig } = require('../config/env')
const apiWorkers = require('./api/api-workers')
const express = require('express')
const bodyParser = require('body-parser')
const logger = require('../logging/logger-main')
const pretty = require('express-prettify')
const { createSocketioManager } = require('./wsockets')
const { logRequests, logResponses } = require('./middleware')
const { OPERATION_TYPES, INTERNAL_EVENT, SOCKETIO_EVENT } = require('../constants')

function setupLoggingMiddlleware (app, enableRequestLogging, enableResponseLogging) {
  if (enableRequestLogging) {
    app.use(logRequests)
  }
  if (enableResponseLogging) {
    app.use(logResponses)
  }
}

function linkLedgerCpyWorkersToSockets (socketioManager, serviceWorkers) {
  logger.info(`Linking workers of operationType ${OPERATION_TYPES.LEDGER_CPY} with sockets.`)
  const workerQuery = { operationTypes: [OPERATION_TYPES.LEDGER_CPY] }
  const workers = serviceWorkers.getWorkers(workerQuery)
  for (const worker of workers) {
    const emitter = worker.getEventEmitter()
    const { workerId, subledger, operationType, indyNetworkId } = worker.getWorkerInfo()
    if (operationType === OPERATION_TYPES.LEDGER_CPY) {
      socketioManager.forwardEmitterEventToWebsocket(emitter, workerId, INTERNAL_EVENT.TX_PROCESSED, SOCKETIO_EVENT.LEDGER_TX_SCANNED, indyNetworkId, subledger)
      socketioManager.forwardEmitterEventToWebsocket(emitter, workerId, INTERNAL_EVENT.TX_RESCAN_SCHEDULED, SOCKETIO_EVENT.LEDGER_TX_SCAN_SCHEDULED, indyNetworkId, subledger)
    }
  }
}

function linkExpansionWorkersToSockets (socketioManager, serviceWorkers) {
  logger.info(`Linking workers of operationType ${OPERATION_TYPES.EXPANSION} with sockets.`)
  const workerQuery = { operationTypes: [OPERATION_TYPES.EXPANSION] }
  const workers = serviceWorkers.getWorkers(workerQuery)
  for (const worker of workers) {
    const emitter = worker.getEventEmitter()
    const { workerId, subledger, operationType, indyNetworkId } = worker.getWorkerInfo()
    if (operationType === OPERATION_TYPES.EXPANSION) {
      socketioManager.forwardEmitterEventToWebsocket(emitter, workerId, INTERNAL_EVENT.TX_PROCESSED, SOCKETIO_EVENT.SCANNED_TX_PROCESSED, indyNetworkId, subledger)
      socketioManager.forwardEmitterEventToWebsocket(emitter, workerId, INTERNAL_EVENT.TX_RESCAN_SCHEDULED, SOCKETIO_EVENT.SCANNED_TX_PROCESSING_SCHEDULED, indyNetworkId, subledger)
    }
  }
}

function createRoomJoinReactor (serviceWorkers) {
  function onRoomJoined (room, socket) {
    const workerQuery = { operationTypes: [OPERATION_TYPES.EXPANSION], indyNetworkIds: [room] }
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
  linkLedgerCpyWorkersToSockets(socketioManager, serviceWorkers)
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
