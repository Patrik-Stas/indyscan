const logger = require('../logging/logger-main')
const { createStorageReadEs } = require('indyscan-storage')
const { Client } = require('@elastic/elasticsearch')

async function createSourceElasticsearch ({ id, url, index }) {
  const esClient = new Client({ node: url })
  const storageRead = createStorageReadEs(esClient, index, logger)

  async function getTxData (subledger, seqNo, format) {
    const { idata, imeta } = await storageRead.getOneTx(subledger, seqNo, format) // eslint-disable-line
    return idata
  }

  async function getHighestSeqno (subledger, format) {
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
