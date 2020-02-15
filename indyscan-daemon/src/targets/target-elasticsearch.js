const {interfaces, implTarget} = require('../factory')
const logger = require('../logging/logger-main')
const {createStorageWriteEs} = require('indyscan-storage')
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

async function createTargetElasticsearch ({id, url, index, replicas = 0}) {
  await waitUntilElasticIsReady(url)

  const esClient = new elasticsearch.Client({node: url})
  let storageWrite
  try {
    storageWrite = await createStorageWriteEs(esClient, index, replicas, logger)
  } catch (err) {
    throw Error(`Failed to create ES storage for index ${index}. Details: ${err.message} ${err.stack}`)
  }

  async function addTxData (subledger, seqNo) {
    return storageWrite.addTx(seqNo)
  }

  function getObjectId () {
    return id
  }

  async function getInterfaceName () {
    return interfaces.target
  }

  async function getImplName () {
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


