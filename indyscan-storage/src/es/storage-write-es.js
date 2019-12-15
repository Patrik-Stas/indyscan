const { esFilterSubledgerName, esAndFilters, esFilterBySeqNo, esFilterHasTimestamp } = require('./es-query-builder')
const { txTypeToSubledgerName } = require('indyscan-txtype')

/*
esClient - elasticsearch client
esIndex - name of the index to read/write data from/to
esReplicaCount - if <esIndex> doesn't exist yet, it will be created with <esReplicaCount> replicas
subledgerName - indy subledger managed by this storage client
assureEsIndex - whether shall this storage client try to create index if it doesnt exists. This is useful if you creating multiple
                storage clients (different subledgers) for the same network in parallel
expectEsIndex - if true and the esIndex is not already created, it will throw
createEsTransformedTx - function taking 1 argument, a transaction as found on ledger. Returns somewhat transformed transaction
logger (optional) - winston logger
 */
async function createStorageEs (esClient, esIndex, esReplicaCount, subledgerName, assureEsIndex, expectEsIndex, createEsTransformedTx, logger) {
  const knownSubledgers = ['DOMAIN', 'POOL', 'CONFIG']
  const subledgerNameUpperCase = subledgerName.toUpperCase()
  if (knownSubledgers.includes(subledgerNameUpperCase) === false) {
    throw Error(`Unknown subledger '${subledgerNameUpperCase}'. Known ledger = ${JSON.stringify(knownSubledgers)}`)
  }
  const subledgerTxsQuery = esFilterSubledgerName(subledgerNameUpperCase)

  const existsResponse = await esClient.indices.exists({ index: esIndex })
  const { body: indexExists } = existsResponse
  if (indexExists === undefined || indexExists === null) {
    throw Error(`Can't figure out if index ${esIndex} exists in ES. ES Response: ${JSON.stringify(existsResponse)}.`)
  }

  if (expectEsIndex && !indexExists) {
    throw Error(`Index ${esIndex} was expected to already exist, but did not!`)
  }
  if (assureEsIndex && !indexExists) {
    await createEsIndex()
  }

  async function createEsIndex () {
    let createIndexRes = await esClient.indices.create({
      index: esIndex,
      body: {
        settings: {
          index: {
            number_of_replicas: esReplicaCount
          }
        }
      }
    })
    if (createIndexRes.statusCode !== 200) {
      throw Error(`Problem creating index ${esIndex}. ES Response: ${createIndexRes}`)
    }

    const coreMappings = {
      index: esIndex,
      body: {
        'properties': {
          'original': { type: 'text', index: false },

          // Every tx
          'indyscan.ver': { type: 'keyword' },
          'indyscan.rootHash': { type: 'keyword' },
          'indyscan.txn.type': { type: 'keyword' },
          'indyscan.txn.typeName': { type: 'keyword' },
          'indyscan.subledger.code': { type: 'keyword' },
          'indyscan.subledger.name': { type: 'keyword' },
          'indyscan.txn.protocolVersion': { type: 'keyword' },
          'indyscan.txn.metadata.from': { type: 'keyword' },
          'indyscan.txn.metadata.reqId': { type: 'keyword' },
          'indyscan.txn.data.data.blskey': { type: 'keyword' },
          'indyscan.txn.data.data.blskey_pop': { type: 'keyword' },
          'indyscan.meta.scanTime': { type: 'date', format: 'date_time' },

          'indyscan.txnMetadata.seqNo': { type: 'integer' },
          'indyscan.txnMetadata.txnTime': { type: 'date', format: 'date_time' },

          // TX: NYM, ATTRIB
          'indyscan.txn.data.raw': { type: 'text' },
          'indyscan.txn.data.dest': { type: 'keyword' },

          // TX: CLAIM_DEF
          'indyscan.txn.data.refSchemaTxnSeqno': { type: 'integer' },
          'indyscan.txn.data.refSchemaTxnTime': { type: 'date', format: 'date_time' },
          'indyscan.txn.data.refSchemaVersion': { type: 'keyword' },
          'indyscan.txn.data.refSchemaFrom': { type: 'keyword' },


          // TX: pool NODE transaction
          'indyscan.txn.data.data.client_ip': { type: 'ip' },
          'indyscan.txn.data.data.client_port': { type: 'integer' },
          'indyscan.txn.data.data.node_ip': { type: 'ip' },
          'indyscan.txn.data.data.node_port': { type: 'integer' },

          // TX: NODE tx geo information
          'indyscan.txn.data.data.client_ip_geo.location': { type: 'geo_point' },
          'indyscan.txn.data.data.client_ip_geo.eu': { type: 'boolean' },
          'indyscan.txn.data.data.node_ip_geo.location': { type: 'geo_point' },
          'indyscan.txn.data.data.node_ip_geo.eu': { type: 'boolean' },

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
    await esClient.indices.putMapping(coreMappings)
  }

  async function getTxCount (query) {
    query = query ? esAndFilters(subledgerTxsQuery, query) : subledgerTxsQuery
    const { body } = await esClient.search({
      index: esIndex,
      filter_path: 'hits.total',
      body: { query }
    })
    return body.hits.total.value
  }

  async function _getTxBySeqNo (seqNo) {
    const query = esAndFilters(subledgerTxsQuery, esFilterBySeqNo(seqNo))
    const { body } = await esClient.search({
      index: esIndex,
      body: { query }
    })
    if (!(body || body.hits || body.hits.hits)) {
      throw Error(`Invalid response from ElasticSearch: ${JSON.stringify(body)}`)
    }
    if (body.hits.hits.length > 1) {
      throw Error(`Requested tx seqno ${seqNo} but ${body.hits.hits.length} documents were returned. Should only be 1.`)
    }
    if (body.hits.hits.length === 0) {
      return null
    }
    return body.hits.hits[0]['_source']
  }

  async function getTxBySeqNo (seqNo) {
    const tx = await _getTxBySeqNo(seqNo)
    if (!tx) {
      return undefined
    }
    return JSON.parse(tx.original)
  }

  async function getFullTxBySeqNo (seqNo) {
    return _getTxBySeqNo(seqNo)
  }

  async function getOldestTimestamp () {
    let txs = await getTxs(0,
      1,
      esFilterHasTimestamp(),
      { 'indyscan.txnMetadata.seqNo': { 'order': 'asc' } }
    )
    return txs[0].txnMetadata.txnTime
  }

  async function getTxsTimestamps (skip, limit, query) {
    let txs = await getTxs(skip, limit, esAndFilters(query, esFilterHasTimestamp()), null)
    return txs.map(t => t.txnMetadata.txnTime)
  }

  async function _getTxs (skip, limit, query, sort) {
    query = query ? esAndFilters(subledgerTxsQuery, query) : subledgerTxsQuery
    sort = sort || { 'indyscan.txnMetadata.seqNo': { 'order': 'desc' } }
    const searchRequest = {
      from: skip,
      size: limit,
      index: esIndex,
      body: { query, sort }
    }
    const { body } = await esClient.search(searchRequest)
    return body.hits.hits.map(h => h['_source'])
  }

  // async function _searchTxs (skip, limit, searchQuery) {
  //   let query = esFullTextsearch(searchQuery)
  //   let sort = { 'indyscan.txnMetadata.seqNo': { 'order': 'desc' } }
  //   const searchRequest = {
  //     from: skip,
  //     size: limit,
  //     index,
  //     body: { query, sort }
  //   }
  //   const { body } = await client.search(searchRequest)
  //   return body.hits.hits.map(h => h['_source'])
  // }

  /*
  Returns array of (by default all) transactions.
  By default are transactions sorted from the latest (index 0) to the oldest (last index of result array)
   */
  async function getTxs (skip, limit, query, sort) {
    let hits = await _getTxs(skip, limit, query, sort)
    return hits.map(h => JSON.parse(h.original))
  }
  //
  // async function searchTxs (skip, limit, searchText) {
  //   return _searchTxs(skip, limit, searchText)
  // }

  async function getFullTxs (skip, limit, query, sort) {
    return _getTxs(skip, limit, query, sort)
  }

  async function findMaxSeqNo () {
    let txs = await getTxs(0,
      1,
      null,
      { 'indyscan.txnMetadata.seqNo': { 'order': 'desc' } },
      null
    )
    if (txs.length === 0) {
      return 0
    } else return txs[0].txnMetadata.seqNo
  }

  // let createEsTransformedTx = createEsTxTransform(getTxBySeqNo.bind(this))

  async function addTx (tx) {
    if (!tx || !tx.txnMetadata || tx.txnMetadata.seqNo === undefined || tx.txnMetadata.seqNo === null) {
      throw Error(`Tx failed basic validation. Tx ${JSON.stringify(tx)}`)
    }
    let recognizedSubledger = txTypeToSubledgerName(tx.txn.type)
    if (recognizedSubledger === undefined || recognizedSubledger === null) {
      if (logger) {
        logger.warn(`Can't verify which subledger txn.type '${tx.txn.type}' belongs to. Maybe a new Indy tx type?`)
      }
    } else if (recognizedSubledger.toUpperCase() !== subledgerNameUpperCase) {
      throw Error(`Won't add transaction to storage. It is considered to belong to ${recognizedSubledger}` +
        ` but attempt was made to add it to storage for subledger '${subledgerNameUpperCase}'.` +
        ` The transaction: '${JSON.stringify(tx)}'.`)
    }
    let transformed = await createEsTransformedTx(tx)
    transformed.meta = {
      scanTime: new Date().toISOString()
    }
    let data = {
      original: JSON.stringify(tx),
      indyscan: transformed
    }
    await esClient.index({
      id: `${subledgerNameUpperCase}-${tx.txnMetadata.seqNo}`,
      index: esIndex,
      body: data
    })
  }

  return {
    findMaxSeqNo,
    addTx,
    getOldestTimestamp,
    getTxsTimestamps,
    getTxs,
    getFullTxs,
    getTxCount,
    getTxBySeqNo,
    getFullTxBySeqNo
  }
}

module.exports.createStorageEs = createStorageEs
