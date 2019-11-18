const appConfig = require('./config')
const util = require('util')
const { createStorageMongo, createMongoCollection, createStorageEs } = require('indyscan-storage')
const logger = require('./logging/logger-main')

module.exports.createStorageFactory = async function createStorageFactory () {
  let esClient
  let mongoHost

  if (appConfig.USE_STORAGE === 'ELASTIC_SEARCH') {
    const elasticsearch = require('@elastic/elasticsearch')
    console.log(`Connecting to ElasticSearh '${appConfig.URL_ES}'.`)
    esClient = new elasticsearch.Client({ node: appConfig.URL_ES })
  } else if (appConfig.USE_STORAGE === 'MONGO') {
    const mongodb = require('mongodb')
    const asyncMongoConnect = util.promisify(mongodb.MongoClient.connect)
    console.log(`Connecting to Mongo '${appConfig.URL_MONGO}'.`)
    mongoHost = await asyncMongoConnect(appConfig.URL_MONGO)
  }

  async function createEsStoragesForNetwork (networkName) {
    logger.debug(`Creating ElasticSearch storages for network '${networkName}'.`)
    const storageDomain = await createStorageEs(esClient, `txs-${networkName.toLowerCase()}-domain`)
    const storagePool = await createStorageEs(esClient, `txs-${networkName.toLowerCase()}-pool`)
    const storageConfig = await createStorageEs(esClient, `txs-${networkName.toLowerCase()}-config`)
    return { storageDomain, storagePool, storageConfig }
  }

  async function createMongoStoragesForNetwork (networkName) {
    logger.debug(`Creating MongoDB storages for network '${networkName}'.`)
    let mongoDb = await mongoHost.db(networkName)
    const storageDomain = await createStorageMongo(await createMongoCollection(mongoDb, 'txs-domain'))
    const storagePool = await createStorageMongo(await createMongoCollection(mongoDb, 'txs-pool'))
    const storageConfig = await createStorageMongo(await createMongoCollection(mongoDb, 'txs-config'))
    return { storageDomain, storagePool, storageConfig }
  }

  async function createStoragesForNetwork (networkName) {
    if (appConfig.USE_STORAGE === 'ELASTIC_SEARCH') {
      return createEsStoragesForNetwork(networkName)
    } else if (appConfig.USE_STORAGE === 'MONGO') {
      return createMongoStoragesForNetwork(networkName)
    } else {
      throw Error(`Unknown storage`)
    }
  }

  return {
    createStoragesForNetwork
  }
}
