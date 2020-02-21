const logger = require('../logging/logger-main')
const { createStorageReadEs } = require('indyscan-storage')
const { Client } = require('@elastic/elasticsearch')

async function createSourceElasticsearch ({ id, url, index }) {
  const esClient = new Client({ node: url })
  const storageRead = createStorageReadEs(esClient, index, logger)

  async function getTxData (subledger, seqNo, format = 'full') {
    return storageRead.getOneTx(subledger, seqNo, format)
  }

  async function getHighestSeqno (subledger, format = 'full') {
    return storageRead.findMaxSeqNo(subledger, format)
  }

  function getObjectId () {
    return id
  }

  return {
    getObjectId,
    getTxData,
    getHighestSeqno
  }
}

module.exports.createSourceElasticsearch = createSourceElasticsearch
