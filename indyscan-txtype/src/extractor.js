const { parseSchemaId } = require('./util')

function extractSchemaTxInfo (tx) {
  const txnSeqno = tx.txnMetadata.seqNo
  const txnTime = tx.txnMetadata.txnTime
  const schemaId = tx.txnMetadata.txnId
  const { schemaFrom, schemaName, schemaVersion } = parseSchemaId(schemaId)
  const attributes = tx.txn.data.data.attr_names
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
