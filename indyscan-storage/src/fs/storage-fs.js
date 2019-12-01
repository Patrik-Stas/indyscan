const { projectAvailableTimestamps } = require('../projections')
const { createStorage } = require('./storage-wrapper')

async function createStorageFs (name) {
  const fsstorage = await createStorage(name)

  async function getTxCount (filter = null) {
    if (filter) {
      throw Error('Not implemented.')
    }
    return fsstorage.length()
  }

  async function getTxBySeqNo (seqNo) {
    return fsstorage.get(seqNo)
  }

  /*
  Returns array of unix-time timestamps (seconds granularity) of (by default all) transactions which contain timestamp.
  Non-timestamped transactions are skipped.
  By default are transactions sorted from latest (index 0) to the oldest (last index of result array)
   */
  async function getOldestTimestamp () {
    const txCount = await getTxCount()
    for (let i = 1; i <= txCount; i++) {
      const tx = await fsstorage.get(i)
      if (tx['txnMetadata'] && tx['txnMetadata']['txnTime']) {
        return tx['txnMetadata']['txnTime']
      }
    }
  }

  async function getTxsTimestamps (skip = null, limit = null, filter = null, sort = null, projection = null) {
    return getTxs(skip, limit, filter, sort, projection, projectAvailableTimestamps)
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
    transform = transform || ((txs) => txs)
    const total = await getTxCount()
    let txsSlice = []
    limit = limit || total
    for (let i = total - skip; i > 0 && i > total - (skip + limit); i--) {
      txsSlice.push(await fsstorage.get(i))
    }
    return transform(txsSlice)
  }

  async function findMaxSeqNo () {
    const txs = await fsstorage.values()
    if (txs.length === 0) {
      return 0
    }
    return Math.max.apply(null, txs.map(tx => tx.txnMetadata.seqNo))
  }

  async function addTx (tx) {
    const seqNo = tx['txnMetadata']['seqNo']
    if (!seqNo) {
      throw Error('Transaction must have seqNo.')
    }
    return fsstorage.set(seqNo, tx)
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

module.exports.createStorageFs = createStorageFs
