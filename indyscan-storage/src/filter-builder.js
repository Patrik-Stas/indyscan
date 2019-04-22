const txTypeUtils = require('indyscan-txtype')

function buildFilterByTxNames (txNames) {
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

module.exports.buildFilterByTxNames = buildFilterByTxNames
