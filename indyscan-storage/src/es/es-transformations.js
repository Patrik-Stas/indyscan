const { txTypeToTxName, extractSchemaTxInfo } = require('indyscan-txtype')

function createEsTxTransform (resolveTxBySeqno) {
  function noop (tx) {
    return Object.assign({}, tx)
  }

  async function credDef (tx) {
    let transformedTx = Object.assign({}, tx)
    const schemaRefSeqNo = tx.txn.data.ref
    let schemaTx = resolveTxBySeqno(schemaRefSeqNo)
    const { txnSeqno, txnTime, schemaId, schemaFrom, schemaName, schemaVersion, attributes } = extractSchemaTxInfo(schemaTx)
    if (txnSeqno !== schemaRefSeqNo) {
      throw Error(`txnSeqno !== schemaRefSeqNo. This should never happen.`)
    }
    transformedTx.txn.data = { schema: {} }
    transformedTx.txn.data.schema.txnSeqno = txnSeqno
    transformedTx.txn.data.schema.txnTime = txnTime
    transformedTx.txn.data.schema.schemaId = schemaId
    transformedTx.txn.data.schema.schemaName = schemaName
    transformedTx.txn.data.schema.schemaVersion = schemaVersion
    transformedTx.txn.data.schema.schemaFrom = schemaFrom
    transformedTx.txn.data.schema.schemaAttributes = attributes
    return transformedTx
  }

  const txTransforms = {
    'NYM': noop,
    'ATTRIB': noop,
    'SCHEMA': noop,
    'CLAIM_DEF': credDef,
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

  async function esTxTransform (tx) {
    const transform = txTransforms[txTypeToTxName(tx.txn.type)] || noop
    return transform(tx)
  }

  return esTxTransform
}

module.exports.createEsTxTransform = createEsTxTransform
