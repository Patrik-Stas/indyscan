const logger = require('../logging/logger-main')

async function createSourceElasticsearch ({id, url, indexDomain, indexPool, indexConfig}) {
  const esClient = new elasticsearch.Client({node: url})
  const storageReadDomain = createStorageReadEs(esClient, indexDomain, 'domain', logger)
  const storageReadPool = createStorageReadEs(esClient, indexPool, 'pool', logger)
  const storageReadConfig = createStorageReadEs(esClient, indexConfig, 'config', logger)

  function resolveEsReadStorage (subledger) {
    if (format === 'domain') {
      return storageReadDomain
    } else if (format === 'pool') {
      return storageReadPool
    } else if (format === 'config') {
      return storageReadConfig
    } else {
      throw Error(`Unknown subledger ${subledger}`)
    }
  }

  async function getTx (subledger, seqNo, format = 'original') {
    storageRead = resolveEsReadStorage(subledger)
    return storageRead.getTxBySeqNo(seqNo, format)
  }

  async function getHighestSeqno (subledger) {
    storageRead = resolveEsReadStorage(subledger)
    return storageRead.findMaxSeqNo(seqNo)
  }

  function getObjectId() {
    return id
  }

  return {
    getObjectId,
    getTx,
    getHighestSeqno
  }
}

module.exports.createSourceElasticsearch = createSourceElasticsearch
