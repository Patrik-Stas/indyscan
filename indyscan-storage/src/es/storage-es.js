const { createEsTxTransform } = require('./es-transformations')
const { esAndFilters, esFilterBySeqNo, esFilterHasTimestamp } = require('./es-query-builder')

async function createStorageEs (client, index, replicaCount, subledgerName) {
  subledgerName = subledgerName.toUpperCase()

  // let subledgerQuery = {
  //
  // }

  const { body: indexExists } = await client.indices.exists({ index })

  if (!indexExists) {
    console.log(`Creating index ${index}`)
    let createIndexRes = await client.indices.create({
      index: index,
      body: {
        settings: {
          index: {
            number_of_replicas: replicaCount
          }
        }
      }
    })
    console.log(JSON.stringify(createIndexRes, null, 2))

    const coreMappings = {
      index,
      body: {
        'properties': {
          'original': { type: 'text', index: false },
          'indyscan.txnMetadata.seqNo': { type: 'integer' },
          'indyscan.txnMetadata.txnTime': { type: 'date', format: 'date_time' },
          'indyscan.txnMetadata.txnId': { type: 'keyword', index: true },

          // TX: CLAIM_DEF
          'indyscan.txn.data.refSchemaTxnSeqno': { type: 'integer' },
          'indyscan.txn.data.refSchemaTxnTime': { type: 'date', format: 'date_time' },
          'indyscan.txn.data.refSchemaId': { type: 'keyword', index: true },
          'indyscan.txn.data.refSchemaName': { type: 'text', index: true },
          'indyscan.txn.data.refSchemaVersion': { type: 'keyword', index: true },
          'indyscan.txn.data.refSchemaFrom': { type: 'keyword', index: true },
          // TODO:: 'txn.data.refSchemaAttributes' :

          // TX: pool NODE transaction
          'indyscan.txn.data.data.alias': { type: 'text', index: true },

          // Added to every tx
          'indyscan.txn.type': { type: 'keyword', index: true },
          'indyscan.txn.typeName': { type: 'keyword', index: true },
          'indyscan.subledger.code': { type: 'keyword', index: true },
          'indyscan.subledger.name': { type: 'keyword', index: true },
          'indyscan.meta.scanTime': { type: 'date', format: 'date_time' },

          // TX: domain AUTHOR_AGREEMENT_AML
          'indyscan.txn.data.aml.at_submission': { type: 'text', analyzer: 'english' },
          'indyscan.txn.data.aml.click_agreement': { type: 'text', analyzer: 'english' },
          'indyscan.txn.data.aml.for_session': { type: 'text', analyzer: 'english' },
          'indyscan.txn.data.aml.on_file': { type: 'text', analyzer: 'english' },
          'indyscan.txn.data.aml.product_eula': { type: 'text', analyzer: 'english' },
          'indyscan.txn.data.aml.service_agreement': { type: 'text', analyzer: 'english' },
          'indyscan.txn.data.aml.wallet_agreement': { type: 'text', analyzer: 'english' },

          // TX: domain AUTHOR_AGREEMENT
          'indyscan.txn.data.text': { type: 'text', analyzer: 'english' }
        }
      }
    }
    await client.indices.putMapping(coreMappings)
  } else {
    console.log(`Idex ${index} alredy exists`)
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
      throw Error(`Requested tx seqno ${seqNo} but ${body.hits.hits.length()} documents were returned. Should only be 1.`)
    }
    if (body.hits.hits.length === 0) {
      return null
    }
    let original = body.hits.hits.map(h => h['_source'])[0]['original']
    console.log(`Retrieved origianl = ${original}`)
    return JSON.parse(original)
  }

  async function getOldestTimestamp () {
    let res = await getTxs(0,
      1,
      esFilterHasTimestamp(),
      { 'indyscan.txnMetadata.seqNo': { 'order': 'asc' } },
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
    sort = sort || { 'indyscan.txnMetadata.seqNo': { 'order': 'desc' } }
    const searchRequest = {
      from: skip,
      size: limit,
      index,
      body: { query, sort }
    }
    console.log(`search req = ${JSON.stringify(searchRequest)}`)
    const { body } = await client.search(searchRequest)
    let documents = body.hits.hits.map(h => JSON.parse(h['_source']['original']))
    return transform ? transform(documents) : documents
  }

  async function findMaxSeqNo () {
    let txs = await getTxs(0,
      1,
      null,
      { 'transformed.txnMetadata.seqNo': { 'order': 'desc' } },
      null
    )
    if (txs.length === 0) {
      return 0
    } else return txs[0].txnMetadata.seqNo
  }

  let createEsTransformedTx = createEsTxTransform(getTxBySeqNo.bind(this))

  async function addTx (tx) {
    let transformed = await createEsTransformedTx(tx, subledgerName)
    transformed.meta = {
      scanTime: new Date().toISOString()
    }
    let data = {
      original: JSON.stringify(tx),
      indyscan: transformed
    }
    console.log(`Index transaction:\n${JSON.stringify(data)}`)
    await client.index({
      index,
      body: data
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
