function parseSchemaId (schemaId) {
  const schemaIdParts = schemaId.split(':')
  const schemaFrom = schemaIdParts[0]
  const schemaName = schemaIdParts[2]
  const schemaVersion = schemaIdParts[3]
  return { schemaFrom, schemaName, schemaVersion }
}

function getSchemaLedgerId (issuerDid, schemaName, schemaVersion) {
  const LEDGER_SCHEMA_MARKER = 2
  return `${issuerDid}:${LEDGER_SCHEMA_MARKER}:${schemaName}:${schemaVersion}`
}

module.exports.getSchemaLedgerId = getSchemaLedgerId
module.exports.parseSchemaId = parseSchemaId
