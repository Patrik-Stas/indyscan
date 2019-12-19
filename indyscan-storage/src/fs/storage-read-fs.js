const { createStorage } = require('./storage-wrapper')

/*
File storage strategy is only used for daemon integration tests
 */
async function createStorageReadFs (name) {
  const fsstorage = await createStorage(name)

  async function getTxCount (query) {
    if (query) {
      throw Error('Not implemented.')
    }
    return fsstorage.length()
  }

  async function getTxBySeqNo (seqNo) {
    return fsstorage.get(seqNo)
  }

  async function getOldestTimestamp () {
    const txCount = await getTxCount()
    for (let i = 1; i <= txCount; i++) {
      const tx = await fsstorage.get(i)
      if (tx['txnMetadata'] && tx['txnMetadata']['txnTime']) {
        return tx['txnMetadata']['txnTime']
      }
    }
  }

  async function getTxsTimestamps (skip, limit, query) {
    throw Error('Not implemented')
  }

  /*
  Returns array of (by default all) transactions.
  By default are transactions sorted from latest (index 0) to the oldest (last index of result array)
   */
  async function getTxs (skip, limit, query, sort) {
    if (query || sort) {
      throw Error('not implemented')
    }
    const total = await getTxCount()
    let txsSlice = []
    skip = skip || 0
    limit = limit || total
    for (let i = total - skip; i > 0 && i > total - (skip + limit); i--) {
      txsSlice.push(await fsstorage.get(i))
    }
    return txsSlice
  }

  async function findMaxSeqNo () {
    const txs = await fsstorage.values()
    if (txs.length === 0) {
      return 0
    }
    return Math.max.apply(null, txs.map(tx => tx.txnMetadata.seqNo))
  }

  async function getFullTxs () {
    throw Error('Not implemented')
  }

  async function getFullTxBySeqNo () {
    throw Error('Not implemented')
  }

  return {
    findMaxSeqNo,
    getOldestTimestamp,
    getTxsTimestamps,
    getTxs,
    getFullTxs,
    getTxCount,
    getTxBySeqNo,
    getFullTxBySeqNo
  }
}

module.exports.createStorageReadFs = createStorageReadFs
