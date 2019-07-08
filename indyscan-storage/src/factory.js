export async function createStorageMongo (mongoDatabase, collectionName) {
  let collection = await mongoDatabase.collection(collectionName)
  await collection.createIndex({ 'txnMetadata.seqNo': 1 })
}
