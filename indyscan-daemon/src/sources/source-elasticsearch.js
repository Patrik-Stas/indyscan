const logger = require('../logging/logger-main')
const {createStorageReadEs} = require('indyscan-storage')
const { Client } = require('@elastic/elasticsearch')
const {interfaces, implSource} = require('../factory')

async function createSourceElasticsearch ({id, url, index}) {
  const esClient = new Client({node: url})
  const storageRead = createStorageReadEs(esClient, index, logger)

  async function getTxData (subledger, seqNo, format = 'original') {
    let originalTx = await storageRead.getOneTx(subledger, seqNo, format)
    if (originalTx) {
      return originalTx.data
    }
    return undefined
  }

  async function getHighestSeqno (subledger) {
    return storageRead.findMaxSeqNo(subledger)
  }

  function getObjectId() {
    return id
  }

  function getInterfaceName() {
    return interfaces.source
  }

  function getImplName() {
    return implSource.elasticsearch
  }

  return {
    getObjectId,
    getTxData,
    getHighestSeqno,
    getInterfaceName,
    getImplName
  }
}

module.exports.createSourceElasticsearch = createSourceElasticsearch
