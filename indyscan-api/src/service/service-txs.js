const indyscanStorage = require('indyscan-storage')
const { esFullTextsearch } = require('indyscan-storage/src/es/es-query-builder')
const { esTxFilters } = indyscanStorage

function urlQueryTxNamesToEsQuery (urlQueryTxNames) {
  const filterTxNames = (urlQueryTxNames) ? JSON.parse(urlQueryTxNames) : []
  if (filterTxNames.length === 0) {
    return null
  } else {
    return esTxFilters.esFilterByTxTypeNames(filterTxNames)
  }
}

function createServiceTxs (ledgerStorageManager) {
  async function getTxs (networkId, subledger, skip, size, filterTxNames, search, format, sortFromMostRecent = true) {
    const txTypeQuery = urlQueryTxNamesToEsQuery(filterTxNames)
    const searchQuery = search ? esFullTextsearch(search) : null
    const sort = (sortFromMostRecent)
      ? { 'imeta.seqNo': { order: 'desc' } }
      : { 'imeta.seqNo': { order: 'asc' } }
    return ledgerStorageManager
      .getStorage(networkId)
      .getManyTxs(subledger, skip, size, [txTypeQuery, searchQuery], sort, format)
  }

  async function getTx (networkId, subledger, seqNo, format) {
    const storage = await ledgerStorageManager.getStorage(networkId)
    return storage.getOneTx(subledger, seqNo, format)
  }

  async function getTxsCount (networkId, subledger, filterTxNames, search) {
    const queries = urlQueryTxNamesToEsQuery(filterTxNames)
    if (search) {
      queries.append(esFullTextsearch(search))
    }
    return ledgerStorageManager.getStorage(networkId).getTxCount(subledger, queries)
  }

  return {
    getTxs,
    getTxsCount,
    getTx
  }
}

module.exports.createServiceTxs = createServiceTxs
