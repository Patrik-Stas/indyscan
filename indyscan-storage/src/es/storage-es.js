async function createStorageEs (client) {
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

  async function getTxsTimestamps (skip = null, limit = null, filter = null, sort = null, projection = null) {
    return [1, 2, 3]
  }

  async function getTxsByQuery (txsQuery) {
    throw Error('not implemented, this will require refactor, this method wass originally made for mongodb')
  }

  /*
  Returns array of (by default all) transactions.
  By default are transactions sorted from latest (index 0) to the oldest (last index of result array)
   */
  async function getTxs (skip = null, limit = null, filter = null, sort = null, projection = null, transform = null) {
    return client.search({
      index: 'txs',
      body: { foo: 'bar' }
    })
  }

  async function findMaxSeqNo () {
    return 123
  }

  async function addTx (tx) {
    await client.index({
      index: 'txs',
      body: tx
    })
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
