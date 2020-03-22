function buildWorkersQuery(operationTypes, subledgers, targetEsIndices, workersIds) {
  return {
    filterOperationTypes: operationTypes,
    filterSubledgers: subledgers,
    filterTargetEsIndices: targetEsIndices,
    filterIds: workersIds
  }
}

module.exports.buildWorkersQuery = buildWorkersQuery
