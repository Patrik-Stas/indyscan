const createIndyClient = require('../indyclient')
const logger = require('../logging/logger-main')
const sleep = require('sleep-promise')

async function createTxResolverLedger (network) {
  let whoami = `LedgerResolver[${network}]`
  let client = null
  let isConnecting = false
  let consecutiveTxResolutionFailures

  async function reconnect () {
    try {
      isConnecting = true
      client = await createIndyClient(network, `sovrinscan-${network}`)
    } catch (e) {
      throw Error(`${whoami} Failed to create client for network client. Details: ${e.message} ${e.stack}.`)
    } finally {
      isConnecting = false
    }
  }

  async function tryReconnect () {
    try {
      await reconnect()
    } catch (err) {
      logger.error(`${whoami} Indy Network connection problem. Will try later.`)
      logger.error(err)
    }
  }

  await tryReconnect()

  async function txResolve (subledger, seqNo) {
    let waitingForConnection = 0
    while (isConnecting) { // eslint-disable-line
      if (waitingForConnection > 10 * 1000) {
        throw Error(`${whoami} No connection available, reconnection in the process. Try later.`)
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
          throw Error(`${whoami} Problem getting tx ${network}/${subledger}/${seqNo} after successful network reconnection has been done.`)
        }
      } else {
        throw Error(`${whoami} Problem getting tx ${network}/${subledger}/${seqNo}. Resolver consecutive failure count: ${consecutiveTxResolutionFailures}`)
      }
    }
  }

  return txResolve
}

module.exports.createTxResolverLedger = createTxResolverLedger
