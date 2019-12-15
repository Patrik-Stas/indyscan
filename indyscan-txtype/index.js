const {
  txNameToTxCode,
  txNamesToTypes,
  txTypeToTxName,
  describeTransaction,
  getDomainsTxNames,
  getPoolTxNames,
  getConfigTxNames,
  txTypeToSubledgerName,
  subledgerIdToName,
  subledgerNameToId,
} = require('./src/types')

const { createEsTxTransform } = require('./src/transformation/transform-tx')

module.exports = {
  txNameToTxCode,
  txNamesToTypes,
  txTypeToTxName,
  describeTransaction,
  getDomainsTxNames,
  getPoolTxNames,
  getConfigTxNames,
  txTypeToSubledgerName,
  subledgerIdToName,
  subledgerNameToId,
  createEsTxTransform
}
