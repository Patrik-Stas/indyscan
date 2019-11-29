const { txTypeToTxName, extractSchemaTxInfo, subledgerIdToName } = require('indyscan-txtype')
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
    tx.txn.data = { }
    tx.txn.data.refSchemaTxnSeqno = txnSeqno
    tx.txn.data.refSchemaTxnTime = txnTime
    tx.txn.data.refSchemaId = schemaId
    tx.txn.data.refSchemaName = schemaName
    tx.txn.data.refSchemaVersion = schemaVersion
    tx.txn.data.refSchemaFrom = schemaFrom
    tx.txn.data.refSchemaAttributes = attributes
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

  const allowedSubledgerCodes = [0, 1, 2]

  async function createEsTransformedTx (tx, subledgerCode) {
    if (!tx) {
      throw Error('tx argument not defined')
    }
    if (!allowedSubledgerCodes.includes(subledgerCode)) {
      throw Error(`Subledger code must be one of following integers: '${JSON.stringify(allowedSubledgerCodes)}'.`)
    }
    let subledgerName = subledgerIdToName(subledgerCode)
    let txName = txTypeToTxName(tx.txn.type) || 'UNKNOWN'
    const transform = txTransforms[txName]
    let transformed = await transform(_.cloneDeep(tx))
    transformed.txn.typeName = txName
    transformed.subledger = {
      code: subledgerCode,
      name: subledgerName
    }
    return transformed
  }

  return createEsTransformedTx
}

module.exports.createEsTxTransform = createEsTxTransform
