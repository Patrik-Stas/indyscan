const { createIndyClient } = require('../indy/indyclient')
const logger = require('../logging/logger-main')
const sleep = require('sleep-promise')

async function createSourceLedger ({id, name, genesisPath= undefined}) {
  let client = null
  let isConnecting = false
  let consecutiveTxResolutionFailures

  async function reconnect () {
    try {
      isConnecting = true
      client = await createIndyClient(name, genesisPath)
    } catch (e) {
      throw Error(`${id} Failed to create client for network client. Details: ${e.message} ${e.stack}.`)
    } finally {
      isConnecting = false
    }
  }

  async function tryReconnect () {
    try {
      await reconnect()
    } catch (err) {
      logger.error(`${id} Indy Network connection problem. Will try later. Error: ${err.message} ${err.stack}`)
    }
  }

  await tryReconnect()

  async function getTx (subledger, seqNo, format = 'original') {
    if (format !== 'original') {
      throw Error(`Only "original" format is supported by "ledger" source.`)
    }
    let waitingForConnection = 0
    while (isConnecting) { // eslint-disable-line
      if (waitingForConnection > 10 * 1000) {
        throw Error(`${id} No connection available, reconnection in the process. Try later.`)
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
          throw Error(`${id} Problem getting tx ${sourceConfigData.genesis}/${subledger}/${seqNo} after successful network reconnection has been done.`)
        }
      } else {
        throw Error(`${id} Problem getting tx ${sourceConfigData.genesis}/${subledger}/${seqNo}. Resolver consecutive failure count: ${consecutiveTxResolutionFailures}`)
      }
    }
  }

  function getHighestSeqno() {
    throw Error('Function getHighestSeqno is not implemented for ledger source. Not expected to be used.')
  }

  function getObjectId() {
    return id
  }

  return {
    getObjectId,
    getTx,
    getHighestSeqno
  }
}

module.exports.createSourceLedger = createSourceLedger
