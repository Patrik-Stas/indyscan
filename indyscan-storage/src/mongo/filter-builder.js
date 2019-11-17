const txTypeUtils = require('indyscan-txtype')

function mongoFilterByTxTypeNames (txNames) {
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

function mongoFilterAboveSeqNo (seqNo) {
  return { 'txnMetadata.seqNo': { '$gte': seqNo } }
}

function mongoFilterBelowSeqNo (seqNo) {
  return { 'txnMetadata.seqNo': { '$lt': seqNo } }
}

function mongoFilterTxnAfterTime (utime) {
  return { 'txnMetadata.txnTime': { '$gte': utime } }
}

function mongoFilterTxnBeforeTime (utime) {
  return { 'txnMetadata.txnTime': { '$lt': utime } }
}

function mongoOrFilters (...filters) {
  return { '$or': [...filters] }
}

function mongoAndFilters (...filters) {
  return { '$and': [...filters] }
}

module.exports.mongoFilterByTxTypeNames = mongoFilterByTxTypeNames
module.exports.mongoFilterTxnAfterTime = mongoFilterTxnAfterTime
module.exports.mongoFilterTxnBeforeTime = mongoFilterTxnBeforeTime
module.exports.mongoFilterAboveSeqNo = mongoFilterAboveSeqNo
module.exports.mongoFilterBelowSeqNo = mongoFilterBelowSeqNo
module.exports.mongoAndFilters = mongoAndFilters
module.exports.mongoOrFilters = mongoOrFilters
