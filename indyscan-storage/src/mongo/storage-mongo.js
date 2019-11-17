const { txsQuery } = require('./query-builder')
const keyTransform = require('./transform-keys')
const { projectAvailableTimestamps } = require('../projections')
const dotTransformer = keyTransform.createReplacementFunction('.', 'U+FF0E')
const removeDotsFromKeys = keyTransform.recursiveJSONKeyTransform(dotTransformer)

/*
 Implementation of IndyScan storage for particular network and ledger
 */
async function
createStorageMongo (collection) {
  async function getTxCount (filter = {}) {
    if (Object.keys(filter) === 0) {
      return collection.estimatedDocumentCount()
    }
    return collection.find(filter).count()
  }

  async function getTxBySeqNo (seqNo) {
    return collection.findOne({ 'txnMetadata.seqNo': seqNo })
  }

  /*
  Returns array of unix-time timestamps (seconds granularity) of (by default all) transactions which contain timestamp.
  Non-timestamped transactions are skipped.
  By default are transactions sorted from latest (index 0) to the oldest (last index of result array)
   */
  async function getOldestTimestamp () {
    const txs = await getTxsTimestamps(0, 1, { 'txnMetadata.txnTime': { $exists: true } }, { 'txnMetadata.seqNo': 1 })
    if (txs.length === 0) {
      return null
    }
    return txs[0]
  }

  async function getTxsTimestamps (skip = null, limit = null, filter = null, sort = { 'txnMetadata.seqNo': -1 }, projection = null) {
    return getTxs(skip, limit, filter, sort, projectAvailableTimestamps)
  }

  async function _getTxsByQuery (txsQuery) {
    return txsQuery.executeAgainst(collection)
  }

  /*
  Returns array of (by default all) transactions.
  By default are transactions sorted from latest (index 0) to the oldest (last index of result array)
   */
  async function getTxs (skip = null, limit = null, filter = null, sort = null, transform = null) {
    sort = (sort) || { 'txnMetadata.seqNo': -1 }
    const q = txsQuery().setLimit(limit).setSkip(skip).setFilter(filter).setSort(sort).setTransform(transform)
    return _getTxsByQuery(q)
  }

  async function findMaxSeqNo () {
    const qres = await collection.aggregate([{ $group: { _id: null, maxTx: { $max: '$txnMetadata.seqNo' } } }]).toArray()
    const { maxTx } = (qres.length > 0) ? qres[0] : { maxTx: 0 }
    return maxTx
  }

  async function addTx (tx) {
    const txWithNoDots = removeDotsFromKeys(tx)
    return collection.insertOne(txWithNoDots, async (err, res) => {
      if (err) {
        console.log('Failed to save transaction. Probably because keys contains character not supported by mongodb. Full err:')
        console.log(err)
        console.log(err.stack)
        console.log(`Original transaction: ${JSON.stringify(tx)}`)
        console.log(`Transformed transaction we tried to insert: ${JSON.stringify(txWithNoDots)}`)
        throw err
      }
    })
  }

  return {
    findMaxSeqNo,
    addTx,
    getOldestTimestamp,
    getTxsTimestamps,
    getTxs,
    getTxCount,
    getTxBySeqNo
  }
}

module.exports.createStorageMongo = createStorageMongo
