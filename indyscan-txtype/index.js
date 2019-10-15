const {TYPE_TO_DETAIL, NAME_TO_DETAIL, LEDGER_TX_NAMES} = require('./txdata')

function txTypeToTxName (txType) {
  const detail = TYPE_TO_DETAIL[txType]
  if (!detail) {
    return undefined
  }
  return detail.txName
}

function txNameToTxCode (txName) {
  const detail = NAME_TO_DETAIL[txName]
  if (!detail) {
    return undefined
  }
  return detail.txType
}

function txNamesToTypes (txNames) {
  let types = []
  for (const txName of txNames) {
    const txCode = txNameToTxCode(txName)
    types.push(txCode)
  }
  return types
}

function getDomainsTxNames () {
  return LEDGER_TX_NAMES['DOMAIN']
}

function getPoolTxNames () {
  return LEDGER_TX_NAMES['POOL']
}

function getConfigTxNames () {
  return LEDGER_TX_NAMES['CONFIG']
}

function describeTransaction (tx) {
  const txType = tx.txn.type
  const detail = TYPE_TO_DETAIL[txType]
  if (!detail) {
    return `Unknown transition ${txType}`
  }
  return detail.description
}

module.exports = {
  txNameToTxCode,
  txNamesToTypes,
  txTypeToTxName,
  describeTransaction,
  getDomainsTxNames,
  getPoolTxNames,
  getConfigTxNames
}
