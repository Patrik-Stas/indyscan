const util = require('util')
const { createStorageReadEs, createStorageWriteEs } = require('indyscan-storage')
const logger = require('../logging/logger-main')
const elasticsearch = require('@elastic/elasticsearch')
const { buildRetryTxResolver, createIndyscanTransform } = require('indyscan-storage')
const geoip = require('geoip-lite')
const geoipLiteLookupIp = geoip.lookup.bind(geoip)
const axios = require('axios')
const sleep = require('sleep-promise')

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
    return createIndyscanTransform(lookupTxBySeqno, geoipLiteLookupIp)
  }

  async function createWriteStoragesElasticsearch (esClient, esIndex, exIndexReplicaCount, subledger, assureEsIndex) {
    const storageReadEs = createStorageReadEs(esClient, esIndex, subledger, logger)
    const transformTx = createTxTransform(subledger, storageReadEs)
    const storageWriteEs = await createStorageWriteEs(esClient, esIndex, exIndexReplicaCount, subledger, assureEsIndex, false, transformTx, logger)
      .then(storage => { return storage })
      .catch(err => {
        logger.error(`Failed to create ES storage for index ${esIndex}: ${util.inspect(err, false, 10)} ${err.stack}`)
        throw Error(`Failed to create ES storage for index ${esIndex}`)
      })
    return { storageReadEs, storageWriteEs }
  }

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

  async function createEsStoragesForNetwork (urlEs, esIndex, exIndexReplicaCount) {
    await waitUntilElasticIsReady(urlEs)

    const esClient = new elasticsearch.Client({ node: urlEs })
    logger.debug(`Creating ElasticSearch storages for network '${esIndex}'.`)

    const domainStoragePromise =
      createEsStorageForSubledger(esClient, esIndex, exIndexReplicaCount, 'DOMAIN', true)
    const poolStoragePromise =
      createEsStorageForSubledger(esClient, esIndex, exIndexReplicaCount, 'POOL', false)
    const configStoragePromise =
      createEsStorageForSubledger(esClient, esIndex, exIndexReplicaCount, 'CONFIG', false)

    {
      storageReadEs: storageReadDomain
      storageReadEs: storageReadPool
      storageReadEs: storageReadConfig
    } // TODO
    const [
      { storageWriteEs: storageWriteDomain },
      { storageWriteEs: storageWritePool },
      { storageWriteEs: storageWriteConfig }
    ] = await Promise.all([domainStoragePromise, poolStoragePromise, configStoragePromise])
    logger.debug(`Created ElasticSearch storages for network '${esIndex}'.`)

    return {
      storageReadDomain,
      storageWriteDomain,
      storageReadPool,
      storageWritePool,
      storageReadConfig,
      storageWriteConfig
    }
  }

  async function createStoragesForNetwork (targetConfig) {
    if (targetConfig.type === 'elasticsearch') {
      return createEsStoragesForNetwork(targetConfig.data.url, targetConfig.data.index, targetConfig.data.indexReplicaCount)
    } else {
      throw Error(`Target type ${targetConfig.type} is not supported. Found in target config: ${JSON.stringify(targetConfig)}`)
    }
  }

  return {
    createStoragesForNetwork
  }
}
