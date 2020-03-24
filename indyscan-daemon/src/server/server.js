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

  const workers = serviceWorkers.getWorkers()
  for (const worker of workers) {
    const emitter = worker.getEventEmitter()
    logger.info(`Registering hook on emitter of worker ${worker.getObjectId()}`)
    emitter.on('tx-processed', (workerInfo, txData) => {
      if (workerInfo.operationType === 'expansion' && workerInfo.targetInfo.esIndex) {
        const room = workerInfo.targetInfo.esIndex
        logger.debug(`Emitting to room ${room} processed transaction from worker worker ${workerInfo.componentId}.`)
        io.to(room).emit('tx-processed', { workerInfo, txData }) // This will emit the event to all connected sockets
      }
    })
  }
}

module.exports.startServer = startServer
