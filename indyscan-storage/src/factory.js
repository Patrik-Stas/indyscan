module.exports.createMongoCollection = async function createMongoCollection (mongoDatabase, collectionName) {
  const collection = await mongoDatabase.collection(collectionName)
  await collection.createIndex({ 'txnMetadata.seqNo': 1 })
  return collection
}
