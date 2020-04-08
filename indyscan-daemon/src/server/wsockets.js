const socketio = require('socket.io')
const util = require('util')
const logger = require('../logging/logger-main')

function createSocketioManager(expressServer) {
  logger.info(`Creating socketio manager`)
  const io = socketio(expressServer)

  function forwardEmitterEventToWebsocket (emitter, eventName, forwardToRoom, subledger) {
    logger.info(`Linking worker emitter to sockets for indyNetworkId=${forwardToRoom} subledger=${subledger}, `)

    emitter.on(eventName, (payload) => {
      io.of('/').in(`${forwardToRoom}`).clients((error, clients) => {
        if (error) {
          logger.error(`Problem listing clients to print info.`)
        }
        logger.info(`Broadcasting into room ${forwardToRoom}: "${eventName}" to ids=${JSON.stringify(clients)}`)
      });
      io.to(forwardToRoom).emit(eventName, payload)
    })
  }


  /**
   * Joins given socket into specified room and calls callback
   * @param {function} onRoomJoined - function to be called when room is changed. Should take 2 parameters - name of
   * room being joined and socket instance of the ws client joining the room
   */
  function socketJoinRoom(onRoomJoined, socket, room) {
    logger.info(`Joining new room '${room}'.`)
    socket.join(room)
    socket.room = room
    socket.emit('switched-room-notification', room)
    onRoomJoined(room, socket)
  }

  function socketLeaveRoom(socket) {
    logger.info(`Leaving current room '${socket.room}'.`)
    socket.leave(socket.room)
    socket.room = undefined
  }

  function setupBasicSocketioListeners(onRoomJoined) {
    logger.info(`Setting up socketio event listeners.`)
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
        if (socket.room && socket.room !== indyNetworkId) {
          socketLeaveRoom(socket)
        }
        socketJoinRoom(onRoomJoined, socket, indyNetworkId)
      })
    })
  }

  return {
    setupBasicSocketioListeners,
    forwardEmitterEventToWebsocket
  }
}


module.exports.createSocketioManager = createSocketioManager
