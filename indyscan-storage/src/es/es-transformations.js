const { txTypeToTxName, extractSchemaTxInfo, subledgerNameToId } = require('indyscan-txtype')
const _ = require('lodash')
const sleep = require('sleep-promise')

function createEsTxTransform (resolveTxBySeqno) {
  function noop (tx) {
    return Object.assign({}, tx)
  }

  async function tryResolveTx (seqNo, timeoutMs, retryLimit) {
    let retryCnt = 0
    let schemaTx
    while (!schemaTx) {
      if (retryCnt === retryLimit) {
        throw Error(`Can't resolve referenced schema TX ${seqNo} after ${retryCnt} retries using timeout ${timeoutMs}ms`)
      }
      schemaTx = await resolveTxBySeqno(seqNo)
      if (!schemaTx) {
        await sleep(timeoutMs)
      }
      retryCnt++
    }
    return schemaTx
  }

  async function transformCredDef (tx) {
    const schemaRefSeqNo = tx.txn.data.ref
    let schemaTx = await tryResolveTx(schemaRefSeqNo, 333, 6)
    const { txnSeqno, txnTime, schemaId, schemaFrom, schemaName, schemaVersion, attributes } = extractSchemaTxInfo(schemaTx)
    if (txnSeqno !== schemaRefSeqNo) {
      throw Error(`txnSeqno !== schemaRefSeqNo. This should never happen.`)
    }
    tx.txn.data = { }
    tx.txn.data.refSchemaTxnSeqno = txnSeqno
    if (txnTime) {
      let epochMiliseconds = txnTime * 1000
      tx.txn.data.refSchemaTxnTime = new Date(epochMiliseconds).toISOString()
    }
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
    "SET_FEES": noop,
    'UNKNOWN': noop
  }

  const allowedSubledgerNames = ['DOMAIN', 'POOL', 'CONFIG']

  async function createEsTransformedTx (tx, subledgerName) {
    if (!tx) {
      throw Error('tx argument not defined')
    }
    subledgerName = subledgerName.toUpperCase()
    if (!allowedSubledgerNames.includes(subledgerName)) {
      throw Error(`Provided subledger name ${subledgerName}. Allowed values: '${JSON.stringify(allowedSubledgerNames)}'.`)
    }
    let subledgerCode = subledgerNameToId(subledgerName)
    let txName = txTypeToTxName(tx.txn.type) || 'UNKNOWN'
    const transform = txTransforms[txName]
    let transformed = await transform(_.cloneDeep(tx))
    if (transformed.txnMetadata.txnTime) {
      let epochMiliseconds = transformed.txnMetadata.txnTime * 1000
      transformed.txnMetadata.txnTime = new Date(epochMiliseconds).toISOString()
    }
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
