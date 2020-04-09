const { createIndyClient } = require('../indy/indyclient')
const globalLogger = require('../logging/logger-main')
const sleep = require('sleep-promise')

async function createSourceLedger ({ indyNetworkId, name, genesisPath }) {
  let client = null
  let isConnecting = false
  let consecutiveTxResolutionFailures = 0

  const loggerMetadata = {
    metadaemon: {
      indyNetworkId: name,
      componentType: 'source-ledger'
    }
  }

  async function reconnect () {
    try {
      isConnecting = true
      client = await createIndyClient(indyNetworkId, name, genesisPath)
    } catch (e) {
      throw Error(`Failed to create indy client for network ${name}. Details: ${e.message} ${e.stack}.`)
    } finally {
      isConnecting = false
    }
  }

  async function tryReconnect () {
    try {
      await reconnect()
    } catch (err) {
      globalLogger.error(`Indy Network connection problem. Will try later. Error: ${err.message} ${err.stack}`, loggerMetadata)
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
        throw Error('No connection available, reconnection in the process. Try later.')
      }
      await sleep(100)
      waitingForConnection += 100
    }
    try {
      if (!client || consecutiveTxResolutionFailures !== 0) {
        await tryReconnect()
      }
      const result = await client.getTx(subledger, seqNo)
      consecutiveTxResolutionFailures = 0
      return result
    } catch (err) {
      consecutiveTxResolutionFailures++
      throw Error(`Problem getting tx ${name}/${subledger}/${seqNo}. Resolver consecutive failure count: ${consecutiveTxResolutionFailures}`)
    }
  }

  function getHighestSeqno (_subledger) {
    throw Error('getHighestSeqno is not implemented for ledger source. Not expected to be used.')
  }

  function describe () {
    return `Ledger ${indyNetworkId}`
  }

  function getSourceInfo () {
    return {
      indyNetworkId,
      implementation: 'ledger',
      name,
      genesisPath
    }
  }

  return {
    getSourceInfo,
    getTxData,
    getHighestSeqno,
    describe
  }
}

module.exports.createSourceLedger = createSourceLedger
