const { parseSchemaId } = require('indyscan-txtype')

function createClaimDefTransform (resolveDomainTxBySeqNo) {
  function extractSchemaTxInfo (originalTx) {
    const txnSeqno = originalTx.txnMetadata.seqNo
    const txnTime = originalTx.txnMetadata.txnTime
    const schemaId = originalTx.txnMetadata.txnId
    const { schemaFrom, schemaName, schemaVersion } = parseSchemaId(schemaId)
    const attributes = originalTx.txn.data.data.attr_names
    return {
      txnSeqno,
      txnTime,
      schemaId,
      schemaFrom,
      schemaName,
      schemaVersion,
      attributes
    }
  }

  async function transformClaimDef (tx) {
    const schemaRefSeqNo = tx.txn.data.ref
    const schemaTx = await resolveDomainTxBySeqNo(schemaRefSeqNo)
    const { txnSeqno, txnTime, schemaId, schemaFrom, schemaName, schemaVersion, attributes } = extractSchemaTxInfo(schemaTx)
    if (txnSeqno !== schemaRefSeqNo) {
      throw Error('txnSeqno !== schemaRefSeqNo. This should never happen.')
    }
    tx.txn.data = {}
    tx.txn.data.refSchemaTxnSeqno = txnSeqno
    if (txnTime) {
      const epochMiliseconds = txnTime * 1000
      tx.txn.data.refSchemaTxnTime = new Date(epochMiliseconds).toISOString()
    }
    tx.txn.data.refSchemaId = schemaId
    tx.txn.data.refSchemaName = schemaName
    tx.txn.data.refSchemaVersion = schemaVersion
    tx.txn.data.refSchemaFrom = schemaFrom
    tx.txn.data.refSchemaAttributes = attributes
    return tx
  }

  return transformClaimDef
}

module.exports.createClaimDefTransform = createClaimDefTransform
