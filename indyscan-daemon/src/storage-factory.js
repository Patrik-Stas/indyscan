const appConfig = require('./config')
const util = require('util')
const { createStorageMongo, createMongoCollection, createStorageEs } = require('indyscan-storage')
const logger = require('./logging/logger-main')
const elasticsearch = require('@elastic/elasticsearch')
const mongodb = require('mongodb')
const asyncMongoConnect = util.promisify(mongodb.MongoClient.connect)

module.exports.createStorageFactory = async function createStorageFactory () {
  async function createEsStorageForSubledger (esClient, esIndex, exIndexReplicaCount, subledger, assureEsIndex) {
    return createStorageEs(esClient, esIndex, exIndexReplicaCount, subledger, assureEsIndex, false, logger)
      .then(storage => { return storage })
      .catch(err => {
        logger.error(`Failed to create ES storage for index ${esIndex}: ${util.inspect(err, false, 10)} ${err.stack}`)
        throw Error(`Failed to create ES storage for index ${esIndex}`)
      })
  }

  async function createEsStoragesForNetwork (urlEs, esIndex, exIndexReplicaCount) {
    const esClient = new elasticsearch.Client({ node: urlEs })
    logger.debug(`Creating ElasticSearch storages for network '${esIndex}'.`)
    const storageDomainPromise = createEsStorageForSubledger(esClient, esIndex, exIndexReplicaCount, 'DOMAIN', true)
    const storagePoolPromise = createEsStorageForSubledger(esClient, esIndex, exIndexReplicaCount, 'POOL', false)
    const storageConfigPromise = createEsStorageForSubledger(esClient, esIndex, exIndexReplicaCount, 'CONFIG', false)
    const [storageDomain, storagePool, storageConfig] =
      await Promise.all([storageDomainPromise, storagePoolPromise, storageConfigPromise])
    return { storageDomain, storagePool, storageConfig }
  }

  async function createMongoStoragesForNetwork (urlMongo, dbName) {
    const mongoHost = await asyncMongoConnect(appConfig.URL_MONGO)
    logger.debug(`Creating MongoDB storages for network '${dbName}'.`)
    const mongoDb = await mongoHost.db(dbName)
    const storageDomain = await createStorageMongo(await createMongoCollection(mongoDb, 'txs-domain'))
    const storagePool = await createStorageMongo(await createMongoCollection(mongoDb, 'txs-pool'))
    const storageConfig = await createStorageMongo(await createMongoCollection(mongoDb, 'txs-config'))
    return { storageDomain, storagePool, storageConfig }
  }

  async function createStoragesForNetwork (targetConfig) {
    if (targetConfig.type === 'elasticsearch') {
      return createEsStoragesForNetwork(targetConfig.data.url, targetConfig.data.index, targetConfig.data.indexReplicaCount)
    } else if (appConfig.type === 'mongo') {
      return createMongoStoragesForNetwork(targetConfig.data.url, targetConfig.data.dbname)
    } else {
      throw Error(`Target type ${targetConfig.type} as per targetConfig: ${JSON.stringify(targetConfig)} is not supported.`)
    }
  }

  return {
    createStoragesForNetwork
  }
}
