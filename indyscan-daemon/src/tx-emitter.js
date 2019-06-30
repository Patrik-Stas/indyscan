const uuid = require('uuid')

/*
Reads requests for transactions, fetches them from network and distribute to registered callbacks
 */
export async function createTxEmitter (network, resolveTxStrategy) {
  let txResolvedCallbacks = []
  let txUnavailableCallbacks = []

  async function emitTxResolved (network, subledger, seqNo, requester, tx) {
    for (const { callback, filter } of txResolvedCallbacks) {
      if (await filter(network, subledger, seqNo, requester, tx)) {
        callback(network, subledger, seqNo, requester, tx)
      }
    }
  }

  async function emitTxUnavailable (network, subledger, seqNo, requester, tx) {
    for (const { callback, filter } of txUnavailableCallbacks) {
      if (await filter(network, subledger, seqNo, requester, tx)) {
        callback(network, subledger, seqNo, requester, tx)
      }
    }
  }

  async function submitTxRequest (network, subledger, seqNo, requester) {
    const requestId = uuid.v4()
    try {
      resolveTxStrategy(network, subledger, seqNo)
        .then(function (tx) {
          emitTxResolved(network, subledger, seqNo, requester, tx)
        }, function (value) {
          emitTxUnavailable(network, subledger, seqNo, requester)
        })
    } catch (error) {

    }
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
