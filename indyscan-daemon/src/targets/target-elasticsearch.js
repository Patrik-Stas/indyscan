const {interfaces, implTarget} = require('../factory')
const logger = require('../logging/logger-main')
const {createStorageWriteEs} = require('indyscan-storage')

async function waitUntilElasticIsReady (esUrl) {
  let agencyReady = false
  while (!agencyReady) {
    try {
      await axios.get(`${esUrl}/_cat`)
      agencyReady = true
    } catch (e) {
      logger.warn(`Waiting for ElasticSearch ${esUrl} to come up.`)
      await sleep(2000)
    }
  }
}

async function createTargetElasticsearch({id, url, indexDomain, indexPool, indexConfig}) {
  const esClient = new elasticsearch.Client({node: url})
  await waitUntilElasticIsReady(urlEs)
  const domainStoragePromise = createWriteStorage(esClient, esIndex, exIndexReplicaCount, 'DOMAIN', true)
  const poolStoragePromise = createWriteStorage(esClient, esIndex, exIndexReplicaCount, 'POOL', false)
  const configStoragePromise = createWriteStorage(esClient, esIndex, exIndexReplicaCount, 'CONFIG', false)

  const [ storageWriteDomain, storageWritePool, storageWriteConfig ]
    = await Promise.all([domainStoragePromise, poolStoragePromise, configStoragePromise])
  logger.debug(`Created ElasticSearch storages for network '${esIndex}'.`)

  async function createWriteStorage (esClient, esIndex, exIndexReplicaCount, subledger, assureEsIndex) {
  return createStorageWriteEs(esClient, esIndex, exIndexReplicaCount, subledger, assureEsIndex, false, transformTx, logger)
    .then(storage => { return storage })
    .catch(err => {
      logger.error(`Failed to create ES storage for index ${esIndex}: ${util.inspect(err, false, 10)} ${err.stack}`)
      throw Error(`Failed to create ES storage for index ${esIndex}`)
    })
}
  function resolveStorage (subledger) {
    if (format === 'domain') {
      return storageWriteDomain
    } else if (format === 'pool') {
      return storageWritePool
    } else if (format === 'config') {
      return storageWriteConfig
    } else {
      throw Error(`Unknown subledger ${subledger}`)
    }
  }

  async function addTxData (subledger, seqNo) {
    let storageWrite = resolveStorage(subledger)
    return storageWrite.addTx(seqNo)
  }

  function getObjectId() {
    return id
  }

  async function getInterfaceName() {
    return interfaces.target
  }

  async function getImplName() {
    return implTarget.elasticsearch
  }

  return {
    getObjectId,
    addTxData,
    getInterfaceName,
    getImplName
  }
}

module.exports.createTargetElasticsearch = createTargetElasticsearch


