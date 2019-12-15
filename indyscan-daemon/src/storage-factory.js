const appConfig = require('./config')
const util = require('util')
const {createStorageMongo, createMongoCollection, createStorageReadEs, createStorageWriteEs} = require('indyscan-storage')
const logger = require('./logging/logger-main')
const elasticsearch = require('@elastic/elasticsearch')
const mongodb = require('mongodb')
const {buildRetryTxResolver} = require('indyscan-storage')
const {createEsTxTransform} = require('indyscan-txtype')
const asyncMongoConnect = util.promisify(mongodb.MongoClient.connect)

module.exports.createStorageFactory = async function createStorageFactory () {

  function createTxTransform (subledger, storageReadEs) {
    let lookupTxBySeqno
    if (subledger.toUpperCase() === 'DOMAIN') {
      let simpleDbTxResolver = storageReadEs.getTxBySeqNo.bind(storageReadEs)
      lookupTxBySeqno = buildRetryTxResolver(simpleDbTxResolver, 1000, 3)
    } else {
      lookupTxBySeqno = (seqno) => {
        throw Error(`Tx-transform module tried to lookup ${subledger} transaction seqNo ${seqno} which was not expected.`)
      }
    }
    return createEsTxTransform(lookupTxBySeqno)
  }

  async function createEsStorageForSubledger (esClient, esIndex, exIndexReplicaCount, subledger, assureEsIndex) {
    const storageReadEs = createStorageReadEs(esClient, esIndex, subledger)
    const transformTx = createTxTransform(subledger, storageReadEs)
    const storageWriteEs = await createStorageWriteEs(esClient, esIndex, exIndexReplicaCount, subledger, assureEsIndex, false, transformTx, logger)
      .then(storage => { return storage })
      .catch(err => {
        logger.error(`Failed to create ES storage for index ${esIndex}: ${util.inspect(err, false, 10)} ${err.stack}`)
        throw Error(`Failed to create ES storage for index ${esIndex}`)
      })
    return {storageReadEs, storageWriteEs}
  }

  async function createEsStoragesForNetwork (urlEs, esIndex, exIndexReplicaCount) {
    const esClient = new elasticsearch.Client({node: urlEs})
    logger.debug(`Creating ElasticSearch storages for network '${esIndex}'.`)

    const domainStoragePromise =
      createEsStorageForSubledger(esClient, esIndex, exIndexReplicaCount, 'DOMAIN', true)
    const poolStoragePromise =
      createEsStorageForSubledger(esClient, esIndex, exIndexReplicaCount, 'POOL', false)
    const configStoragePromise =
      createEsStorageForSubledger(esClient, esIndex, exIndexReplicaCount, 'CONFIG', false)

    const [
      {storageReadEs: storageReadDomain, storageWriteEs: storageWriteDomain},
      {storageReadEs: storageReadPool, storageWriteEs: storageWritePool},
      {storageReadEs: storageReadConfig, storageWriteEs: storageWriteConfig}
    ] = await Promise.all([domainStoragePromise, poolStoragePromise, configStoragePromise])

    return {
      storageReadDomain, storageWriteDomain,
      storageReadPool, storageWritePool,
      storageReadConfig, storageWriteConfig
    }
  }

  async function createMongoStoragesForNetwork (urlMongo, dbName) {
    throw Error('Not supported. If you need this, you can implement and submit pull request.')
    const mongoHost = await asyncMongoConnect(appConfig.URL_MONGO) // eslint-disable-line
    logger.debug(`Creating MongoDB storages for network '${dbName}'.`)
    const mongoDb = await mongoHost.db(dbName)
    const storageDomain = await createStorageMongo(await createMongoCollection(mongoDb, 'txs-domain'))
    const storagePool = await createStorageMongo(await createMongoCollection(mongoDb, 'txs-pool'))
    const storageConfig = await createStorageMongo(await createMongoCollection(mongoDb, 'txs-config'))
    return {storageDomain, storagePool, storageConfig}
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
