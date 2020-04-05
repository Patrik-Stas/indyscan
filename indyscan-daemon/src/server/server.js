const { envConfig } = require('../config/env')
const apiWorkers = require('./api/api-workers')
const express = require('express')
const bodyParser = require('body-parser')
const logger = require('../logging/logger-main')
var pretty = require('express-prettify')
const { logRequests, logResponses } = require('./middleware')
const socketio = require('socket.io')
const util = require('util')

function setupLoggingMiddlleware (app, enableRequestLogging, enableResponseLogging) {
  if (enableRequestLogging) {
    app.use(logRequests)
  }
  if (enableResponseLogging) {
    app.use(logResponses)
  }
}

function linkEmitterToSocket (io, emitter, indyNetworkId, subledger) {
  logger.info(`Linking worker emitter to sockets for indyNetworkId=${indyNetworkId} subledger=${subledger}, `)

  emitter.on('tx-processed', ({ workerData, txData }) => {
    const payload = { workerData, txData }
    const websocketEvent = 'tx-processed'
    const ids = io.sockets.clients(indyNetworkId).map(socket => socket.id)
    logger.info(`Namespace broadcasting "${websocketEvent}" with payload: ${JSON.stringify(payload)} to ids=${JSON.stringify(ids)}`)
    io.to(indyNetworkId).emit(websocketEvent, payload)
  })

  emitter.on('rescan-scheduled', ({ workerData, msTillRescan }) => {
    const payload = { workerData, msTillRescan }
    const websocketEvent = 'rescan-scheduled'
    const ids = io.sockets.clients(indyNetworkId).map(socket => socket.id)
    logger.info(`Namespace broadcasting "${websocketEvent}" with payload: ${JSON.stringify(payload)} to ids=${JSON.stringify(ids)}`)
    io.to(indyNetworkId).emit(websocketEvent, payload)
  })
}

function startServer (serviceWorkers) {
  logger.info('Starting daemon express server!')
  const app = express()
  app.use(bodyParser.json())
  app.use(pretty({ query: 'pretty' }))

  setupLoggingMiddlleware(app, envConfig.LOG_HTTP_REQUESTS === 'true', envConfig.LOG_HTTP_RESPONSES === 'true')

  apiWorkers(app, serviceWorkers)
  const server = app.listen(envConfig.SERVER_PORT, () => logger.info(`Daemon server started at port ${envConfig.SERVER_PORT}!`))

  const io = socketio(server)

  const workers = serviceWorkers.getWorkers()

  io.on('connection', function (socket) {
    logger.info(`Websocket client '${socket.id}' connected`)

    socket.on('disconnect', (reason) => {
      logger.info(`Websocket client '${socket.id}' disconnected. Reason: '${reason}'`)
    })

    socket.on('connect_error', (error) => {
      logger.error(`Websocket client '${socket.id}' connection error: ${util.inspect(error)}`)
    })

    socket.on('switch-room', (indyNetworkId) => {
      if (!indyNetworkId || typeof (indyNetworkId) !== 'string') {
        logger.warn(`Websocket client '${socket.id}' sent switch-room with invalid argument '${util.inspect(indyNetworkId)}'.`)
        socket.emit('switch-room-error', { message: "'switch-room' ws message parameter must be string" })
      }
      logger.info(`Websocket client '${socket.id}' sent switch-room to '${indyNetworkId}'`)
      if (socket.room) {
        logger.info(`Leaving current room '${socket.room}'.`)
        socket.leave(socket.room)
        socket.room = undefined
      }
      logger.info(`Joining new room '${indyNetworkId}'.`)
      socket.join(indyNetworkId)
      socket.room = indyNetworkId
      socket.emit('switched-room-notification', indyNetworkId)
      const workerQuery = {operationTypes: ['expansion'], indyNetworkIds: [indyNetworkId]}
      const networkExpansionWorkers = serviceWorkers.getWorkers(workerQuery)
      for (const worker of networkExpansionWorkers) {
        const rescanScheduledPayload = worker.requestRescheduleStatus()
        // logger.info(`Sending rescan-scheduled for client ${socket.id}. Payload = ${JSON.stringify(rescanScheduledPayload)}`)
        socket.emit('rescan-scheduled', rescanScheduledPayload)
      }
    })
  })

  for (const worker of workers) {
    const emitter = worker.getEventEmitter()
    const { subledger, operationType, indyNetworkId } = worker.getWorkerInfo()
    if (operationType === 'expansion') {
      linkEmitterToSocket(io, emitter, indyNetworkId, subledger)
    }
  }
}

module.exports.startServer = startServer
