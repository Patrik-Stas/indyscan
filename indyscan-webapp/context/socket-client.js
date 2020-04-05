// import util from 'util'
import io from 'socket.io-client'

const socketClients = {}

function getWebsocketClient (websocketsUrl) {
  if (socketClients[websocketsUrl]) {
    return socketClients[websocketsUrl]
  }
  let socket = io.connect(websocketsUrl)
  // console.log(`app.js connected to ${websocketsUrl}`)

  socket.on('connection', function (_socket) {
    logger.info(`app.js WS connection to ${websocketsUrl} established.`)
  })
  socketClients[websocketsUrl] = socket
  return socket
}

export default getWebsocketClient
