const uuid = require('uuid')
const logger = require('./logging/logger-main')
/*
Reads requests for transactions, fetches them from network and distribute to registered callbacks
 */
async function createTxEmitter (network, resolveTxStrategy) {
  let txResolvedCallbacks = []
  let txUnavailableCallbacks = []
  let txResolutionErrorCallbacks = []

  async function emitTxResolved (requestId, network, subledger, seqNo, requester, tx) {
    for (const { callback, filter } of txResolvedCallbacks) {
      if (await filter(requestId, network, subledger, seqNo, requester, tx)) {
        callback(requestId, network, subledger, seqNo, requester, tx)
      }
    }
  }

  async function emitTxUnavailable (requestId, network, subledger, seqNo, requester) {
    for (const { callback, filter } of txUnavailableCallbacks) {
      if (await filter(requestId, network, subledger, seqNo, requester)) {
        callback(requestId, network, subledger, seqNo, requester)
      }
    }
  }

  async function emitResolutionError (requestId, network, subledger, seqNo, requester) {
    for (const { callback, filter } of txResolutionErrorCallbacks) {
      if (await filter(requestId, network, subledger, seqNo, requester)) {
        callback(requestId, network, subledger, seqNo, requester)
      }
    }
  }

  async function submitTxRequest (network, subledger, seqNo, requester) {
    const requestId = uuid.v4()
    const transactionDetails = `network='${network}' subledger='${subledger}' seqNo='${seqNo}' requester='${requester}'`
    const logPrefix = `Emitter::submitTxRequest requestId='${requestId}' ${transactionDetails}`
    logger.debug(`${logPrefix}: Tx resolution request received.`)
    resolveTxStrategy(subledger, seqNo)
      .then(function (tx) {
        if (tx) {
          logger.debug(`${logPrefix}: Resolved tx: ${JSON.stringify(tx)}`)
          emitTxResolved(requestId, network, subledger, seqNo, requester, tx)
        } else {
          logger.debug(`${logPrefix} Transaction does not exist yet.`)
          emitTxUnavailable(requestId, network, subledger, seqNo, requester)
        }
      }).catch(function (err) {
        logger.error(`${logPrefix} Transaction resolution failed.`)
        logger.error(err.stack)
        emitResolutionError(requestId, network, subledger, seqNo, requester)
      })
    return requestId
  }

  function onTxResolved (callback, filter) {
    txResolvedCallbacks.push({ callback, filter })
  }

  function onTxNotAvailable (callback, filter) {
    txUnavailableCallbacks.push({ callback, filter })
  }

  function onResolutionError (callback, filter) {
    txResolutionErrorCallbacks.push({ callback, filter })
  }

  return {
    submitTxRequest,
    onTxResolved,
    onTxNotAvailable,
    onResolutionError
  }
}

module.exports.createTxEmitter = createTxEmitter
