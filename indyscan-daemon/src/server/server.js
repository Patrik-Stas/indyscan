const { envConfig } = require('../config/env')
const apiWorkers = require('./api/api-workers')
const express = require('express')
const bodyParser = require('body-parser')
const logger = require('../logging/logger-main')
var pretty = require('express-prettify')
const { logRequests, logResponses } = require('./middleware')
const socketio = require('socket.io')
const util = require('util')
const { buildWorkersQuery } = require('../../../indyscan-daemon-api-client/src/query-builder')

function setupLoggingMiddlleware (app, enableRequestLogging, enableResponseLogging) {
  if (enableRequestLogging) {
    app.use(logRequests)
  }
  if (enableResponseLogging) {
    app.use(logResponses)
  }
}

function linkEmitterToSocket (io, emitter, indyNetworkId, subledger) {
  const namespace = indyNetworkId
  logger.info(`Linking worker emitter to ws namespace ${namespace}. indyNetworkId=${indyNetworkId} subledger=${subledger}, `)

  emitter.on('tx-processed', ({ workerData, txData }) => {
    const payload = { workerData, txData }
    const websocketEvent = 'tx-processed'
    logger.debug(`Namespace "${namespace}" broadcasting "${websocketEvent}" with payload: ${JSON.stringify(payload)}.`)
    io.to(indyNetworkId).emit(websocketEvent, payload)
  })

  emitter.on('rescan-scheduled', ({ workerData, msTillRescan }) => {
    const payload = { workerData, msTillRescan }
    const websocketEvent = 'rescan-scheduled'
    logger.debug(`Namespace "${namespace}" broadcasting "${websocketEvent}" with payload: ${JSON.stringify(payload)}.`)
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
      const networkExpansionWorkers = serviceWorkers.getWorkers(buildWorkersQuery('expansion', undefined, undefined, undefined, indyNetworkId))
      for (const worker of networkExpansionWorkers) {
        const rescanScheduledPayload = worker.requestRescheduleStatus()
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
