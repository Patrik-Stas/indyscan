const uuid = require('uuid')
const logger = require('./logging/logger-main')
/*
Reads requests for transactions, fetches them from network and distribute to registered callbacks
 */
async function createTxEmitter (network, resolveTxStrategy) {
  let txResolvedCallbacks = []
  let txUnavailableCallbacks = []

  async function emitTxResolved (requestId, network, subledger, seqNo, requester, tx) {
    logger.info(`Emitter: tx request '${requestId}' resolved.`)
    for (const { callback, filter } of txResolvedCallbacks) {
      if (await filter(network, subledger, seqNo, requester, tx)) {
        callback(network, subledger, seqNo, requester, tx)
      }
    }
  }

  async function emitTxUnavailable (requestId, network, subledger, seqNo, requester, tx) {
    logger.info(`Emitter: tx request '${requestId}' unresolved.`)
    for (const { callback, filter } of txUnavailableCallbacks) {
      if (await filter(network, subledger, seqNo, requester, tx)) {
        callback(network, subledger, seqNo, requester, tx)
      }
    }
  }

  async function submitTxRequest (network, subledger, seqNo, requester) {
    const requestId = uuid.v4()
    logger.info(`Emitter: Received tx request ${requestId}: network=${network}, subledger=${subledger}, seqNo=${seqNo}, requester=${requester}`)
    resolveTxStrategy(network, subledger, seqNo)
      .then(function (tx) {
        logger.info(`Emitter: Resolved tx: ${JSON.stringify(tx)}`)
        emitTxResolved(requestId, network, subledger, seqNo, requester, tx)
      }).catch(function (err) {
        logger.error(`Tx resolution ${requestId}: promise was rejected!`)
        logger.error(err.stack)
        emitTxUnavailable(requestId, network, subledger, seqNo, requester)
      })
    logger.info(`Emitter: Returning from tx request ${requestId}:`)
    return requestId
  }

  function onTxResolved (callback, filter) {
    txResolvedCallbacks.push({ callback, filter })
  }

  function onTxNotAvailable (callback, filter) {
    txUnavailableCallbacks.push({ callback, filter })
  }

  return {
    submitTxRequest,
    onTxResolved,
    onTxNotAvailable
  }
}

module.exports.createTxEmitter = createTxEmitter
