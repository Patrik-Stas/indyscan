const globalLogger = require('../logging/logger-main')
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
      globalLogger.warn(`Waiting for ElasticSearch ${esUrl} to come up.`)
      await sleep(2000)
    }
  }
}

async function createTargetElasticsearch ({ indyNetworkId, url, index, replicas = 0 }) {
  const loggerMetadata = {
    metadaemon: {
      indyNetworkId,
      componentType: 'target-es'
    }
  }

  await waitUntilElasticIsReady(url)

  const esClient = new elasticsearch.Client({ node: url })
  let storageWrite
  try {
    storageWrite = await createStorageWriteEs(esClient, index, replicas)
  } catch (err) {
    throw Error(`Failed to create ES storage for index ${index}. Details: ${err.message} ${err.stack}`)
  }

  async function addTxData (subledger, seqNo, format, txData, logger = globalLogger) {
    return storageWrite.addTx(subledger, seqNo, format, txData, logger)
  }

  async function setMappings (formatName, indexMappings, logger = globalLogger) {
    logger.info(`Setting up mappings for ES ${url}, index ${index}, tx format ${formatName}!`, loggerMetadata)
    logger.debug(`Mapping details: ${JSON.stringify(indexMappings, null, 2)}`, loggerMetadata)
    return storageWrite.setFormatMappings(formatName, indexMappings, logger)
  }

  function describe () {
    return `Target ${url}/${index}`
  }

  function getTargetInfo () {
    return {
      indyNetworkId,
      esUrl: url,
      esIndex: index,
      esIndexReplicas: replicas
    }
  }

  return {
    addTxData,
    setMappings,
    describe,
    getTargetInfo
  }
}

module.exports.createTargetElasticsearch = createTargetElasticsearch
