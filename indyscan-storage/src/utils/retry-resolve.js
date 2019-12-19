const sleep = require('sleep-promise')

/*
This is handy when you index transaction and you know you might try to look it up straight after. If the storage did
non yet fully index the transaction, you might have to wait a bit. This resolver wrapper will help you do that.
 */
function buildRetryTxResolver (resolveTxBySeqno, timeoutMs, retryLimit) {
  async function tryResolveTx (seqNo) {
    let retryCnt = 0
    let tx
    while (!tx) {
      if (retryCnt === retryLimit) {
        throw Error(`Can't resolve referenced schema TX ${seqNo} after ${retryCnt} retries using timeout ${timeoutMs}ms`)
      }
      tx = await resolveTxBySeqno(seqNo)
      if (!tx) {
        await sleep(timeoutMs)
      }
      retryCnt++
    }
    return tx
  }

  return tryResolveTx
}

module.exports.buildRetryTxResolver = buildRetryTxResolver
