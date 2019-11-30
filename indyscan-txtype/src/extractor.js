const { parseSchemaId } = require('./util')

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

module.exports.extractSchemaTxInfo = extractSchemaTxInfo
