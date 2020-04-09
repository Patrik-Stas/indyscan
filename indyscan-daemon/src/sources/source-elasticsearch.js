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
    getSourceInfo,
    getTxData,
    getHighestSeqno,
    describe
  }
}

module.exports.createSourceElasticsearch = createSourceElasticsearch
