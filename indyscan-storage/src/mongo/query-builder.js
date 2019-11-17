module.exports.txsQuery = function txsQuery () {
  let skip = null
  let limit = null
  let filter = {}
  let sort = { 'txnMetadata.seqNo': -1 }
  let transform = null
  let projection = null

  const buildFunctions = {
    setSkip,
    setLimit,
    setFilter,
    setSort,
    setTransform,
    executeAgainst
  }

  function setFilter (queryFilter) {
    filter = queryFilter
    return buildFunctions
  }

  function setLimit (queryLimit) {
    limit = queryLimit
    return buildFunctions
  }

  function setSkip (querySkip) {
    skip = querySkip
    return buildFunctions
  }

  function setSort (querySort) {
    sort = querySort
    return buildFunctions
  }

  function setTransform (resultTransform) {
    transform = resultTransform
    return buildFunctions
  }

  function setProjection (queryProjection) {
    projection = queryProjection
    return buildFunctions
  }

  async function executeAgainst (collection) {
    let finalProjection = projection || {}
    finalProjection['_id'] = 0
    let finalFilter = filter || {}
    let result = collection.find(finalFilter, finalProjection)
    if (skip !== null) {
      result = result.skip(skip)
    }
    if (limit !== null) {
      result = result.limit(limit)
    }
    const txs = (sort != null) ? await result.sort(sort).toArray() : await result.toArray()
    if (transform) {
      return transform(txs)
    }
    return txs
  }

  return buildFunctions
}
