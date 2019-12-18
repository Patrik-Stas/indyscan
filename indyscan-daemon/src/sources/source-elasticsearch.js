const logger = require('../logging/logger-main')
const sleep = require('sleep-promise')

async function createSourceElasticsearch ({esUrl, subledger, index }) {
  let whoami = `Source.ElasticSearch[${JSON.stringify({esUrl, subledger, index})}]`

  const esClient = new elasticsearch.Client({ node: esUrl })
  const storageRead = createStorageReadEs(esClient, esIndex, subledger, logger)

  async function txResolve (seqNo) {
    storageRead.getTxBySeqNo(seqNo)
  }

  return txResolve
}

module.exports.createTxResolverLedger = createSourceElasticsearch
