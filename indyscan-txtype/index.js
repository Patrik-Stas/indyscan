const {TX_DETAILS, LEDGER_TX_NAMES, NAME_TO_TYPE, TYPE_TO_NAME} = require('./txdata')

function txTypeToTxName (txType) {
  return TYPE_TO_NAME[txType]
}

function txNameToTxCode (txName) {
  return NAME_TO_TYPE[txName]
}

function txTypesToNames (txTypes) {
  let names = []
  for (const txType of txTypes) {
    names.push(txTypeToTxName(txType))
  }
  return names
}

function txNamesToTypes (txNames) {
  let types = []
  for (const txName of txNames) {
    types.push(txNameToTxCode(txName))
  }
  return types
}

function getLedgerTxTypes (ledger) {
  return LEDGER_TX_NAMES[ledger]
}

function getDomainsTxNames () {
  return LEDGER_TX_NAMES.domain
}

function getPoolTxNames () {
  return LEDGER_TX_NAMES.pool
}

function getConfigTxNames () {
  return LEDGER_TX_NAMES.config
}

function txTypToTxDescription (txType) {
  return TX_DETAILS[txType]['description']
}

function genFieldChangeString (fieldObj) {
  const fieldNames = Object.keys(fieldObj)
  let changes = []
  for (let i = 0; i < fieldNames.length; i++) {
    const fieldName = fieldNames[i]
    const value = fieldObj[fieldName]
    if (value) {
      changes.push(`Value of ${fieldName} changed to ${value}.`)
    }
  }
  return changes
}

function describeTransaction (tx) {
  const code = tx.txn.type
  const txName = txTypeToTxName(code)
  if (!txName) {
    return `Unknown transition ${code}`
  }
  switch (txName) {
    case 'NODE':
      const {alias, blskey, node_ip, client_port, node_port, services} = tx.txn.data.data
      // const changeObj = {
      //   'alias': alias,
      //   'blskey': blskey,
      //   'node_ip': node_ip,
      //   'client_port': client_port,
      //   'node_port': node_port,
      //   'services': services
      // }
      // const changes = genFieldChangeString(changeObj)
      const {dest} = tx.txn.data
      // return `Adds or updates node ${dest} with alias ${alias}. Changes: ${changes.join(' ')}`
      return `Adds or updates node ${dest} with alias ${alias}.`
    case 'NYM':
      return 'TODO tx Description'
    case 'ATTRIB':
      return 'TODO tx Description'
    case 'SCHEMA':
      return 'TODO tx Description'
    case 'CLAIM_DEF':
      return 'TODO tx Description'
    case 'POOL_UPGRADE':
      return 'TODO tx Description'
    case 'NODE_UPGRADE':
      return 'TODO tx Description'
    case 'POOL_CONFIG':
      return 'TODO tx Description'
  }
}

module.exports = {
  txNameToTxCode,
  txNamesToTypes,
  txTypeToTxName,
  txTypesToNames,
  txTypToTxDescription,
  genFieldChangeString,
  describeTransaction,
  getDomainsTxNames,
  getPoolTxNames,
  getConfigTxNames,
  getLedgerTxTypes
}
