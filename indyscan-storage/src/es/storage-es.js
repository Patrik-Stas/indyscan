const { createEsTxTransform } = require('./es-transformations')
const { esTransform } = require('./es-transformations')
const { esAndFilters, esFilterBySeqNo, esFilterHasTimestamp } = require('./es-query-builder')

async function createStorageEs (client, index, replicaCount) {
  const { body: indexExists } = await client.indices.exists({ index })

  if (!indexExists) {
    await client.indices.create({
      index: index,
      body: {
        settings: {
          index: {
            number_of_replicas: replicaCount
          }
        }
      }
    })

    const coreMappings = {
      index,
      body: {
        'properties': {
          'txnMetadata.seqNo': { 'type': 'integer' },
          'txnMetadata.txnTime': { 'type': 'date', 'format': 'epoch_second' }
        }
      }
    }
    await client.indices.putMapping(coreMappings)
  }

  async function getTxCount (query) {
    query = query || { 'match_all': {} }
    const { body } = await client.search({
      index,
      filter_path: 'hits.total',
      body: { query }
    })
    return body.hits.total.value
  }

  async function getTxBySeqNo (seqNo) {
    const query = esFilterBySeqNo(seqNo)
    const { body } = await client.search({
      index,
      body: { query }
    })
    if (body.hits.hits.length > 1) {
      throw Error(`Requested tx seqno ${seqNo} but ${res.hits.hits.length()} documents were returned. Should only be 1.`)
    }
    if (body.hits.hits.length === 0) {
      return null
    }
    return body.hits.hits.map(h => h['_source'])[0]['original']
  }

  async function getOldestTimestamp () {
    let res = await getTxs(0,
      1,
      esFilterHasTimestamp(),
      { 'txnMetadata.seqNo': { 'order': 'asc' } },
      (txs) => txs.map(t => t.txnMetadata.txnTime)
    )
    return res[0]
  }

  async function getTxsTimestamps (skip, limit, query) {
    return getTxs(skip, limit, esAndFilters(query, esFilterHasTimestamp()), null, (txs) => txs.map(t => t.txnMetadata.txnTime))
  }

  /*
  Returns array of (by default all) transactions.
  By default are transactions sorted from the latest (index 0) to the oldest (last index of result array)
   */
  async function getTxs (skip, limit, query, sort, transform) {
    query = query || { 'match_all': {} }
    sort = sort || { 'txnMetadata.seqNo': { 'order': 'desc' } }
    const searchRequest = {
      from: skip,
      size: limit,
      index,
      body: { query, sort }
    }
    const { body } = await client.search(searchRequest)
    let documents = body.hits.hits.map(h => h['_source'])
    return transform ? transform(documents) : documents
  }

  async function findMaxSeqNo () {
    let txs = await getTxs(0,
      1,
      null,
      { 'txnMetadata.seqNo': { 'order': 'desc' } },
      null
    )
    if (txs.length === 0) {
      return 0
    } else return txs[0].txnMetadata.seqNo
  }

  let esTxTransform = createEsTxTransform(getTxBySeqNo.bind(this))

  async function addTx (tx) {
    let transformedTx = await esTxTransform(tx)
    await client.index({
      index,
      body: transformedTx
    })
  }

  return {
    findMaxSeqNo,
    addTx,
    getOldestTimestamp,
    getTxsTimestamps,
    getTxs,
    getTxCount,
    getTxBySeqNo
  }
}

module.exports.createStorageEs = createStorageEs
