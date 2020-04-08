function buildWorkersQuery (operationTypes, subledgers, targetEsIndices, workersIds, indyNetworkIds) {
  return {
    filterIndyNetworkIds: indyNetworkIds,
    filterOperationTypes: operationTypes,
    filterSubledgers: subledgers,
    filterTargetEsIndices: targetEsIndices,
    filterIds: workersIds
  }
}

module.exports.buildWorkersQuery = buildWorkersQuery
