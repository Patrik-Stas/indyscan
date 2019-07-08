const txTypeUtils = require('indyscan-txtype')

function filterByTxTypeNames (txNames) {
  const txTypes = txTypeUtils.txNamesToTypes(txNames)
  let filterArray = []
  for (const txType of txTypes) {
    const txFilter = { 'txn.type': txType.toString() }
    filterArray.push(txFilter)
  }
  if (filterArray.length > 0) {
    return { '$or': filterArray }
  }
  return {}
}

function filterAboveSeqNo (seqNo) {
  return { 'txnMetadata.seqNo': { '$gte': seqNo } }
}

function filterBelowSeqNo (seqNo) {
  return { 'txnMetadata.seqNo': { '$lt': seqNo } }
}

function filterTxnAfterTime (utime) {
  return { 'txnMetadata.txnTime': { '$gte': utime } }
}

function filterTxnBeforeTime (utime) {
  return { 'txnMetadata.txnTime': { '$lt': utime } }
}

function orFilters (...filters) {
  return { '$or': [...filters] }
}

function andFilters (...filters) {
  return { '$and': [...filters] }
}

module.exports.filterByTxTypeNames = filterByTxTypeNames
module.exports.filterTxnAfterTime = filterTxnAfterTime
module.exports.filterTxnBeforeTime = filterTxnBeforeTime
module.exports.filterAboveSeqNo = filterAboveSeqNo
module.exports.filterBelowSeqNo = filterBelowSeqNo
module.exports.andFilters = andFilters
module.exports.orFilters = orFilters
