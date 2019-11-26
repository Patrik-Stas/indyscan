const { txTypeToTxName } = require('indyscan-txtype')

function noop (tx) {
  return Object.assign({}, tx)
}

const txTransforms = {
  'NYM': noop,
  'ATTRIB': noop,
  'SCHEMA': noop,
  'CLAIM_DEF': noop,
  'REVOC_REG_DEF': noop,
  'REVOC_REG_ENTRY': noop,
  'SET_CONTEXT': noop,
  'NODE': noop,
  'POOL_UPGRADE': noop,
  'NODE_UPGRADE': noop,
  'POOL_CONFIG': noop,
  'AUTH_RULE': noop,
  'AUTH_RULES': noop,
  'TXN_AUTHOR_AGREEMENT': noop,
  'TXN_AUTHOR_AGREEMENT_AML': noop
}

async function esTransform (tx) {
  let final = {}
  final['original'] = Object.assign({}, tx)
  final['transformed'] = {}
  const txTypeName = txTypeToTxName(tx.txn.type)
  const txTransform = txTransforms[txTypeName] || noop
  final['transformed'] = txTransform(tx)
  return final
}

module.exports.esTransform = esTransform
