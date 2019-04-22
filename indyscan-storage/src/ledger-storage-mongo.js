const keyTransform = require('./transform-keys')
const dotTransformer = keyTransform.createReplacementFunction('.', 'U+FF0E')
const removeDotsFromKeys = keyTransform.recursiveJSONKeyTransform(dotTransformer)

async function createLedgerStore (mongoDatabase, collectionName) {
  let collection = await mongoDatabase.collection(collectionName)
  await collection.createIndex({ 'txnMetadata.seqNo': 1 })

  async function getTxCount (filter = {}) {
    if (Object.keys(filter) === 0) {
      return collection.estimatedDocumentCount()
    }
    return collection.find(filter).count()
  }

  async function getTxBySeqNo (seqNo) {
    return collection.findOne({ 'txnMetadata.seqNo': seqNo })
  }

  async function getTxRange (skip, limit, filter = {}) {
    const txs = await collection.find(filter).skip(skip).limit(limit).sort({ 'txnMetadata.seqNo': -1 }).toArray()
    return txs
  }

  async function getAllTimestamps () {
    const arr = await collection.find({}, { 'projection': { 'txnMetadata.txnTime': 1 } }).toArray()
    const filtered = arr.filter(t => !!t.txnMetadata.txnTime).map(t => t.txnMetadata.txnTime * 1000)
    return filtered
  }

  async function findMaxTxIdInDb () {
    const qres = await collection.aggregate([{ $group: { _id: null, maxTx: { $max: '$txnMetadata.seqNo' } } }]).toArray()
    const { maxTx } = (qres.length > 0) ? qres[0] : { maxTx: 0 }
    return maxTx
  }

  async function addTx (tx) {
    console.log(`Inserting transaction to ${collectionName} collection!`)
    console.log(JSON.stringify(tx))
    const txWithNoDots = removeDotsFromKeys(tx)
    await collection.insertOne(txWithNoDots, async (err, res) => {
      if (err) {
        console.log('Failed to save transaction. Probably because keys contains character not supported by mongodb. Full err:')
        console.log(err)
        console.log(err.stack)
        console.log(`Original transaction: ${JSON.stringify(tx)}`)
        console.log(`Transformed transaction we tried to insert: ${JSON.stringify(txWithNoDots)}`)
        throw Error(`Failed to insert tx in db.`)
      }
    })
  }

  return {
    findMaxTxIdInDb,
    addTx,
    getTxRange,
    getAllTimestamps,
    getTxCount,
    getTxBySeqNo
  }
}

module.exports.createLedgerStore = createLedgerStore
