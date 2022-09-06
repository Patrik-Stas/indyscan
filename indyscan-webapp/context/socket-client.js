// import util from 'util'
import io from 'socket.io-client'

let socketClient

function assureWebsocketClient () {
  if (socketClient) {
    return socketClient
  }
  socketClient = io.connect('')
  return socketClient
}


function getWebsocketClient () {
  return socketClient
}

export {
  assureWebsocketClient,
  getWebsocketClient
}
