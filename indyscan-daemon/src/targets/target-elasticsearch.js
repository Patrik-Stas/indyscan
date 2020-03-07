const logger = require('../logging/logger-main')
const { createStorageWriteEs } = require('indyscan-storage')
const sleep = require('sleep-promise')
const axios = require('axios')
const elasticsearch = require('@elastic/elasticsearch')

async function waitUntilElasticIsReady (esUrl) {
  let isReady = false
  while (!isReady) {
    try {
      await axios.get(`${esUrl}/_cat`)
      isReady = true
    } catch (e) {
      logger.warn(`Waiting for ElasticSearch ${esUrl} to come up.`)
      await sleep(2000)
    }
  }
}

async function createTargetElasticsearch ({ indyNetworkId, operationId, componentId, url, index, replicas = 0 }) {
  const loggerMetadata = {
    metadaemon: {
      indyNetworkId,
      operationId,
      componentId,
      componentType: 'target-es'
    }
  }

  await waitUntilElasticIsReady(url)

  const esClient = new elasticsearch.Client({ node: url })
  let storageWrite
  try {
    storageWrite = await createStorageWriteEs(esClient, index, replicas, logger)
  } catch (err) {
    throw Error(`Failed to create ES storage for index ${index}. Details: ${err.message} ${err.stack}`)
  }

  async function addTxData (subledger, seqNo, format, txData) {
    return storageWrite.addTx(subledger, seqNo, format, txData)
  }

  async function setMappings (formatName, indexMappings) {
    logger.info(`Setting up mappings for ES ${url}, index ${index}, tx format ${formatName}!`, loggerMetadata)
    logger.debug(`Mapping details: ${JSON.stringify(indexMappings, null, 2)}`, loggerMetadata)
    return storageWrite.setFormatMappings(formatName, indexMappings)
  }

  function getObjectId () {
    return componentId
  }

  function describe() {
    return `Target ${url}/${index}`
  }

  return {
    getObjectId,
    addTxData,
    setMappings,
    describe
  }
}

module.exports.createTargetElasticsearch = createTargetElasticsearch
