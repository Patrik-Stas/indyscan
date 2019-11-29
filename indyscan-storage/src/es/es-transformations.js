const { txTypeToTxName, extractSchemaTxInfo } = require('indyscan-txtype')
const _ = require('lodash')

function createEsTxTransform (resolveTxBySeqno) {
  function noop (tx) {
    return Object.assign({}, tx)
  }

  async function transformCredDef (tx) {
    const schemaRefSeqNo = tx.txn.data.ref
    let schemaTx = resolveTxBySeqno(schemaRefSeqNo)
    const { txnSeqno, txnTime, schemaId, schemaFrom, schemaName, schemaVersion, attributes } = extractSchemaTxInfo(schemaTx)
    if (txnSeqno !== schemaRefSeqNo) {
      throw Error(`txnSeqno !== schemaRefSeqNo. This should never happen.`)
    }
    tx.txn.data = { schema: {} }
    tx.txn.data.schema.txnSeqno = txnSeqno
    tx.txn.data.schema.txnTime = txnTime
    tx.txn.data.schema.schemaId = schemaId
    tx.txn.data.schema.schemaName = schemaName
    tx.txn.data.schema.schemaVersion = schemaVersion
    tx.txn.data.schema.schemaFrom = schemaFrom
    tx.txn.data.schema.schemaAttributes = attributes
    return tx
  }

  async function transformPoolUpgrade (tx) {
    if (tx.txn.data && tx.txn.data.schedule !== undefined) {
      let originalSchedule = Object.assign({}, tx.txn.data.schedule)
      tx.txn.data.schedule = []
      for (const scheduleKey of Object.keys(originalSchedule)) {
        let scheduleTime = originalSchedule[scheduleKey]
        tx.txn.data.schedule.push({ scheduleKey, scheduleTime })
      }
    }
    return tx
  }

  const txTransforms = {
    'NYM': noop,
    'ATTRIB': noop,
    'SCHEMA': noop,
    'CLAIM_DEF': transformCredDef,
    'REVOC_REG_DEF': noop,
    'REVOC_REG_ENTRY': noop,
    'SET_CONTEXT': noop,
    'NODE': noop,
    'POOL_UPGRADE': transformPoolUpgrade,
    'NODE_UPGRADE': noop,
    'POOL_CONFIG': noop,
    'AUTH_RULE': noop,
    'AUTH_RULES': noop,
    'TXN_AUTHOR_AGREEMENT': noop,
    'TXN_AUTHOR_AGREEMENT_AML': noop,
    'UNKNOWN': noop
  }

  async function createEsTransformedTx (tx) {
    let txName = txTypeToTxName(tx.txn.type) || 'UNKNOWN'
    const transform = txTransforms[txName]
    let transformed = await transform(_.cloneDeep(tx))
    transformed.txn.typeName = txName
    return transformed
  }

  return createEsTransformedTx
}

module.exports.createEsTxTransform = createEsTxTransform
