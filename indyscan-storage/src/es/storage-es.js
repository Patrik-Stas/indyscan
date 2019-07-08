async function createStorageEs (esClient) {
  async function getTxCount (filter = {}) {
    return 5
  }

  async function getTxBySeqNo (seqNo) {
    return {}
  }

  /*
  Returns array of unix-time timestamps (seconds granularity) of (by default all) transactions which contain timestamp.
  Non-timestamped transactions are skipped.
  By default are transactions sorted from latest (index 0) to the oldest (last index of result array)
   */
  async function getOldestTimestamp () {
    return {}
  }

  async function getTxsTimestamps (skip = null, limit = null, filter = null, sort = { 'txnMetadata.seqNo': -1 }, projection = null) {
    return [1, 2, 3]
  }

  async function getTxsByQuery (txsQuery) {
    return {}
  }

  /*
  Returns array of (by default all) transactions.
  By default are transactions sorted from latest (index 0) to the oldest (last index of result array)
   */
  async function getTxs (skip = null, limit = null, filter = null, sort = { 'txnMetadata.seqNo': -1 }, projection = null, transform = null) {
    return [{}, {}]
  }

  async function findMaxSeqNo () {
    return 123
  }

  async function addTx (tx) {
    console.log('ok')
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

module.exports.createStorageEs = createStorageEs
