function createStorageMem () {
  let txs = []

  async function getTxCount (filter = {}) {
    return txs.length
  }

  async function getTxBySeqNo (seqNo) {
    return txs[seqNo]
  }

  /*
  Returns array of unix-time timestamps (seconds granularity) of (by default all) transactions which contain timestamp.
  Non-timestamped transactions are skipped.
  By default are transactions sorted from latest (index 0) to the oldest (last index of result array)
   */
  async function getOldestTimestamp () {
    for (let i = 0; i < txs.length; i++) {
      if (txs[i]['txnMetadata'] && txs[i]['txnMetadata']['txnTime']) {
        return txs[i]['txnMetadata']['txnTime']
      }
    }
  }

  async function getTxsTimestamps (skip = null, limit = null, filter = null, sort = { 'txnMetadata.seqNo': -1 }, projection = null) {
    txs.map(tx => tx['txnMetadata']['txnTime'])
  }

  async function getTxsByQuery (txsQuery) {
    throw Error('Not implemented')
  }

  /*
  Returns array of (by default all) transactions.
  By default are transactions sorted from latest (index 0) to the oldest (last index of result array)
   */
  async function getTxs (skip = null, limit = null, filter = null, sort = null, projection = null, transform = null) {
    if (filter || sort || projection) {
      throw Error('not implemented')
    }
    const total = txs.length
    const txSlice = txs.slice(total - (skip + limit), total - skip)
    return transform(txSlice.reverse())
  }

  async function findMaxSeqNo () {
    if (txs.length === 0) {
      return 0
    }
    return txs[txs.length - 1]['txnMetadata']['seqNo']
  }

  async function addTx (tx) {
    txs.push(tx)
  }

  return {
    findMaxSeqNo,
    addTx,
    getOldestTimestamp,
    getTxsTimestamps,
    getTxs,
    getTxsByQuery,
    getTxCount,
    getTxBySeqNo
  }
}

module.exports.createStorageMem = createStorageMem
