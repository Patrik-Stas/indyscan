const {searchOneDocument} = require('./utils')
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
function createStorageReadEs (esClient, esIndex, logger) {
  if (logger === undefined) {
    logger = createWinstonLoggerDummy()
  }
  const whoami = `StorageRead/${esIndex} : `

  function createSubledgerQuery(subledgerName) {
    const knownSubledgers = ['DOMAIN', 'POOL', 'CONFIG']
    const subledgerNameUpperCase = subledgerName.toUpperCase()
    if (knownSubledgers.includes(subledgerNameUpperCase) === false) {
      throw Error(`Unknown subledger '${subledgerNameUpperCase}'. Known ledger = ${JSON.stringify(knownSubledgers)}`)
    }
    return esFilterSubledgerName(subledgerNameUpperCase)
  }

  async function getTxCount (subledger, query) {
    const subledgerTxsQuery = createSubledgerQuery(subledger)
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

  async function getOneTx (subledger, seqNo, format = undefined) {
    const subledgerTxsQuery = createSubledgerQuery(subledger)
    const query = esAndFilters(subledgerTxsQuery, esFilterBySeqNo(seqNo))
    const tx = await searchOneDocument(esClient, esIndex, query)
    if (!tx) {
      return undefined
    }
    if (format) {
      let tmp = tx[format]
      if (!tmp) {
        return undefined
      }
      return tx[format]
    }
    return tx
  }

  /*
  Returns array of (by default all) transactions.
  By default are transactions sorted from the latest (index 0) to the oldest (last index of result array)
   */
  async function getFullTxs (subledger, skip, limit, query, sort) {
    const subledgerTxsQuery = createSubledgerQuery(subledger)
    query = query ? esAndFilters(subledgerTxsQuery, query) : subledgerTxsQuery
    sort = sort || { 'meta.seqNo': { 'order': 'desc' } }
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

  async function findMaxSeqNo (subledger) {
    let txs = await getFullTxs(
      subledger,
      0,
      1,
      null,
      { 'meta.seqNo': { 'order': 'desc' } },
      null
    )
    if (txs.length === 0) {
      return 0
    } else return txs[0].meta.seqNo
  }

  return {
    findMaxSeqNo,
    getOneTx,
    getFullTxs,
    getTxCount,
  }
}

module.exports.createStorageReadEs = createStorageReadEs
