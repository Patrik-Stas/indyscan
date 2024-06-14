const { esSortSeqNoDescending } = require('indyscan-storage/src/es/es-query-builder')
const { esFilterFormatFieldValue } = require('indyscan-storage/src/es/es-query-builder')
const { createStorageReadEs } = require('indyscan-storage')
const { Client } = require('@elastic/elasticsearch')

async function createSourceElasticsearch ({ indyNetworkId, url, index }) {
  const esClient = new Client({ node: url })
  const storageRead = createStorageReadEs(esClient, index)

  async function getTxData (subledger, seqNo, format) {
    const queryFormat = (format === 'original') ? 'serialized' : format
    const result = await storageRead.getOneTx(subledger, seqNo, queryFormat) // eslint-disable-line
    if (!result) {
      return undefined
    }
    const { idata, imeta } = result
    if (!idata || !imeta) {
      throw Error(`Received a response from storage, but idata or imeta was undefined. Storage response = ${JSON.stringify(result, null, 2)}`)
    }
    if (format === 'original') {
      if (queryFormat === 'serialized') {
        return JSON.parse(idata.json)
      } else {
        throw Error('Assumptions on code above broke. If user requests "original", query should had been queried for "serialized".')
      }
    }
    return idata
  }

  async function getHighestSeqno (subledger, format) {
    return storageRead.findMaxSeqNo(subledger, format)
  }

  async function getLatestStateForDid (did) {
    const res =
      await storageRead.getManyTxs('domain', 0, 1, esFilterFormatFieldValue('state', 'did', did), esSortSeqNoDescending(), 'state')
    if (res.length > 1) {
      throw Error(`Returned more results than expected!`)
    }
    if (res.length === 0) {
      return undefined
    }
    return res[0]
  }

  function describe () {
    return `Elasticsearch ${indyNetworkId}/${index}`
  }

  function getSourceInfo () {
    return {
      indyNetworkId,
      implementation: 'elasticsearch',
      esUrl: url,
      esIndex: index
    }
  }

  return {
    getLatestStateForDid,
    getSourceInfo,
    getTxData,
    getHighestSeqno,
    describe
  }
}

module.exports.createSourceElasticsearch = createSourceElasticsearch
