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

async function createTargetElasticsearch ({ id, url, index, replicas = 0 }) {
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
    logger.info(`${id} Setting up mappings for ES ${url}, index ${index}, tx format ${formatName}!`)
    return storageWrite.setFormatMappings(formatName, indexMappings)
  }

  function getObjectId () {
    return id
  }

  return {
    getObjectId,
    addTxData,
    setMappings
  }
}

module.exports.createTargetElasticsearch = createTargetElasticsearch
