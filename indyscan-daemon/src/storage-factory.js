const appConfig = require('./config')

let esClient
let asyncMongoConnect

if (appConfig.URL_MONGO) {
  const mongodb = require('mongodb')
  asyncMongoConnect = util.promisify(mongodb.MongoClient.connect)
}
if (appConfig.URL_ES) {
  const elasticsearch = require('@elastic/elasticsearch')
  esClient = new elasticsearch.Client({node: appConfig.URL_ES})
}

const {createStorageMongo, createMongoCollection} = require('indyscan-storage')

module.exports.createEsStoragesForNetwork = async function createEsStoragesForNetwork(networkName) {
  const storageDomain = await createStorageEs(esClient, `txs-${networkName}-domain`)
  const storagePool = await createStorageEs(esClient, `txs-${networkName}-pool`)
  const storageConfig = await createStorageEs(esClient, `txs-${networkName}-config`)
  return {storageDomain, storagePool, storageConfig}
}


module.exports.createMongoStoragesForNetwork = async function createMongoStoragesForNetwork(networkName) {
  const storageDomain = await createStorageEs(esClient, `txs-${networkName}-domain`)
  const storagePool = await createStorageEs(esClient, `txs-${networkName}-pool`)
  const storageConfig = await createStorageEs(esClient, `txs-${networkName}-config`)
  return {storageDomain, storagePool, storageConfig}
}
