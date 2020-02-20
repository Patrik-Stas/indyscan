const {esFilterContainsFormat} = require('./es-query-builder')
const {SUBLEDGERS} = require('./consts')
const {searchOneDocument} = require('./utils')
const {esFilterSubledgerName, esAndFilters, esFilterBySeqNo} = require('./es-query-builder')
const util = require('util')

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

  function createSubledgerQuery (subledgerName) {
    const knownSubledgers = Object.values(SUBLEDGERS)
    const lowerCased = subledgerName.toLowerCase()
    if (knownSubledgers.includes(lowerCased) === false) {
      throw Error(`Unknown subledger '${lowerCased}'. Known ledger = ${JSON.stringify(knownSubledgers)}`)
    }
    return esFilterSubledgerName(lowerCased)
  }

  async function getTxCount (subledger, query) {
    const subledgerTxsQuery = createSubledgerQuery(subledger)
    query = query ? esAndFilters(subledgerTxsQuery, query) : subledgerTxsQuery
    let request = {
      index: esIndex,
      body: {query}
    }
    logger.debug(`${whoami} Submitting count txs request: ${JSON.stringify(request, null, 2)}`)
    const {body} = await esClient.count(request)
    logger.debug(`${whoami} Received count txs response: ${JSON.stringify(body, null, 2)}`)
    return body.count
  }

  /*
  If format specified, returns specified transaction is selected format if available, otherwise undefined.
  If format not specified, returns transaction if "full" format, which contains all available formats. Example:
  {
     "format1" : { data: "foo" }
     "format2" : { data: "FOO" }
   */
  async function getOneTx (subledger, seqNo, format = 'full') {
    const subledgerTxsQuery = createSubledgerQuery(subledger)
    const query = esAndFilters(subledgerTxsQuery, esFilterBySeqNo(seqNo))
    const tx = await searchOneDocument(esClient, esIndex, query)
    if (!tx) {
      return undefined
    }
    if (format !== 'full') {
      return !!tx.idata ? tx.idata[format] : undefined
    }
    return tx
  }

  async function executeEsSearch(searchRequest) {
    try {
      logger.debug(`${whoami} Submitting ES request ${JSON.stringify(searchRequest, null, 2)}`)
      const {body} = await esClient.search(searchRequest)
      logger.debug(`${whoami} Received ES response ${JSON.stringify(body, null, 2)}`)
      return body
    } catch (e) {
      logger.error(util.inspect(e, undefined, 10))
      throw e
    }
  }

  /*
  Returns array of (by default all) transactions.
  By default are transactions sorted from the latest (index 0) to the oldest (last index of result array)
  The individual transactions are in "full" format.
  Every format ha
   */
  async function getManyTxs (subledger, skip, limit, query, sort, format = 'full') {
    const esQueriesArr = (format === 'full')
      ? [createSubledgerQuery(subledger)]
      : [createSubledgerQuery(subledger), esFilterContainsFormat(format)]

    query = query ? esAndFilters(...esQueriesArr, query) : esAndFilters(...esQueriesArr)
    sort = sort || {'imeta.seqNo': {'order': 'desc'}}
    const searchRequest = {
      from: skip,
      size: limit,
      index: esIndex,
      body: {query, sort}
    }
    let body = await executeEsSearch(searchRequest)
    let fullTxs = body.hits.hits.map(h => h['_source'])
    // todo: Add ES query to return only transactions which contain certain tx formats. We wouldn't then have to do the filtering here
    if (format === 'full') {
      return fullTxs
    }
    return fullTxs
      .map(fullTx => !!fullTx.idata ? fullTx.idata[format]: undefined)
      .filter(formatTx => !!formatTx)
  }

  async function findMaxSeqNo (subledger, format = 'full') {
    let txs = await getManyTxs(
      subledger,
      0,
      1,
      null,
      {'imeta.seqNo': {'order': 'desc'}},
      format
    )
    if (txs.length === 0) {
      return 0
    } else return txs[0].imeta.seqNo
  }

  return {
    findMaxSeqNo,
    getOneTx,
    getManyTxs,
    getTxCount,
  }
}

module.exports.createStorageReadEs = createStorageReadEs
