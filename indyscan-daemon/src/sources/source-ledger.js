const { createIndyClient } = require('../indy/indyclient')
const logger = require('../logging/logger-main')
const sleep = require('sleep-promise')

async function createSourceLedger ({ indyNetworkId, operationId, componentId, name, genesisPath }) {
  logger.info(`----- SRC LEDGER: ${name}`)
  let client = null
  let isConnecting = false
  let consecutiveTxResolutionFailures

  const loggerMetadata = {
    metadaemon: {
      indyNetworkId: name,
      operationId,
      componentId,
      componentType: 'source-ledger'
    }
  }

  async function reconnect () {
    try {
      isConnecting = true
      client = await createIndyClient(indyNetworkId, operationId, `${operationId}-${componentId}.indyclient`, name, genesisPath)
    } catch (e) {
      throw Error(`${componentId} Failed to create indy client for network ${name}. Details: ${e.message} ${e.stack}.`)
    } finally {
      isConnecting = false
    }
  }

  async function tryReconnect () {
    try {
      await reconnect()
    } catch (err) {
      logger.error(`Indy Network connection problem. Will try later. Error: ${err.message} ${err.stack}`, loggerMetadata)
    }
  }

  await tryReconnect()

  async function getTxData (subledger, seqNo, format = 'original') {
    if (format !== 'original') {
      throw Error(`Requested unsupported format ${format}. Only "original" format is supported by "ledger" source.`)
    }
    let waitingForConnection = 0
    while (isConnecting) { // eslint-disable-line
      if (waitingForConnection > 10 * 1000) {
        throw Error(`${componentId} No connection available, reconnection in the process. Try later.`)
      }
      await sleep(100)
      waitingForConnection += 100
    }
    if (!client) {
      await reconnect()
    }
    try {
      return client.getTx(subledger, seqNo)
    } catch (err) {
      consecutiveTxResolutionFailures++
      if (consecutiveTxResolutionFailures > 10) {
        consecutiveTxResolutionFailures = 0
        await reconnect()
        try {
          return client.getTx(subledger, seqNo)
        } catch (err) {
          throw Error(`${componentId} Problem getting tx ${name}/${subledger}/${seqNo} after successful network reconnection has been done.`)
        }
      } else {
        throw Error(`${componentId} Problem getting tx ${name}/${subledger}/${seqNo}. Resolver consecutive failure count: ${consecutiveTxResolutionFailures}`)
      }
    }
  }

  function getHighestSeqno (_subledger) {
    throw Error(`${componentId} getHighestSeqno is not implemented for ledger source. Not expected to be used.`)
  }

  function getObjectId () {
    return componentId
  }

  return {
    getObjectId,
    getTxData,
    getHighestSeqno
  }
}

module.exports.createSourceLedger = createSourceLedger
