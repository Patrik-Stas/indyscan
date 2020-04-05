// import util from 'util'
import io from 'socket.io-client'

let socketClient

function getWebsocketClient () {
  if (socketClient) {
    return socketClient
  }
  socketClient = io.connect('')
  return socketClient
}

export default getWebsocketClient
