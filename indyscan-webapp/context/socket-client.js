// import util from 'util'
import io from 'socket.io-client'

let socketClient

function getWebsocketClient () {
  if (socketClient) {
    return socketClient
  }
  socketClient = io.connect('')
  // console.log(`app.js connected to ${websocketsUrl}`)

  socketClient.on('connection', function (_socket) {
    logger.info(`app.js WS connection established.`)
  })
  return socketClient
}

export default getWebsocketClient
