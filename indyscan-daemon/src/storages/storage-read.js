const { createStorageReadEs } = require('indyscan-storage')
const logger = require('../logging/logger-main')
const elasticsearch = require('@elastic/elasticsearch')

async function createReadStoragesElasticsearch (urlEs, esIndex) {
  const esClient = new elasticsearch.Client({ node: urlEs })
  logger.debug(`Creating ElasticSearch storages for network '${esIndex}'.`)

  const domainStoragePromise = createStorageReadEs(esClient, esIndex, 'DOMAIN', logger)
  const poolStoragePromise = createStorageReadEs(esClient, esIndex, 'POOL', logger)
  const configStoragePromise = createStorageReadEs(esClient, esIndex, 'CONFIG', logger)

  const [
    { storageReadEs: storageReadDomain},
    { storageReadEs: storageReadPool},
    { storageReadEs: storageReadConfig }
  ] = await Promise.all([domainStoragePromise, poolStoragePromise, configStoragePromise])
  logger.debug(`Created ElasticSearch read storages for network '${esIndex}'.`)

  return {
    storageReadDomain,
    storageReadPool,
    storageReadConfig
  }
}

module.exports.createReadStoragesElasticsearch = createReadStoragesElasticsearch
