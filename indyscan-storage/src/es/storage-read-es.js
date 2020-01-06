const { esFilterSubledgerName, esAndFilters, esFilterBySeqNo, esFilterHasTimestamp } = require('./es-query-builder')

function createWinstonLoggerDummy () {
  let logger = {}
  logger.error = (param1, param2) => {}
  logger.warn = (param1, param2) => {}
  logger.info = (param1, param2) => {}
  logger.debug = (param1, param2) => {}
  logger.silly = (param1, param2) => {}
  return logger
}

/*
esClient - elasticsearch client
esIndex - name of the index to read/write data from/to
subledgerName - indy subledger managed by this storage client
logger (optional) - winston logger
 */
function createStorageReadEs (esClient, esIndex, subledgerName, logger) {
  if (logger === undefined) {
    logger = createWinstonLoggerDummy()
  }
  const whoami = `StorageWrite/${esIndex}/${subledgerName} : `
  const knownSubledgers = ['DOMAIN', 'POOL', 'CONFIG']
  const subledgerNameUpperCase = subledgerName.toUpperCase()
  if (knownSubledgers.includes(subledgerNameUpperCase) === false) {
    throw Error(`Unknown subledger '${subledgerNameUpperCase}'. Known ledger = ${JSON.stringify(knownSubledgers)}`)
  }
  const subledgerTxsQuery = esFilterSubledgerName(subledgerNameUpperCase)

  async function getTxCount (query) {
    query = query ? esAndFilters(subledgerTxsQuery, query) : subledgerTxsQuery
    let request = {
      index: esIndex,
      body: { query }
    }
    logger.debug(`${whoami} Submitting count txs request: ${JSON.stringify(request, null, 2)}`)
    const { body } = await esClient.count(request)
    logger.debug(`${whoami} Received count txs response: ${JSON.stringify(body, null, 2)}`)
    return body.count
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
    logger.debug(`${whoami} Submitting ES request ${JSON.stringify(searchRequest, null, 2)}`)
    const { body } = await esClient.search(searchRequest)
    logger.debug(`${whoami} Received ES response ${JSON.stringify(body, null, 2)}`)
    return body.hits.hits.map(h => h['_source'])
  }

  /*
  Returns array of (by default all) transactions.
  By default are transactions sorted from the latest (index 0) to the oldest (last index of result array)
   */
  async function getTxs (skip, limit, query, sort) {
    let hits = await _getTxs(skip, limit, query, sort)
    return hits.map(h => JSON.parse(h.original))
  }

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

  return {
    findMaxSeqNo,
    getOldestTimestamp,
    getTxsTimestamps,
    getTxs,
    getFullTxs,
    getTxCount,
    getTxBySeqNo,
    getFullTxBySeqNo
  }
}

module.exports.createStorageReadEs = createStorageReadEs
