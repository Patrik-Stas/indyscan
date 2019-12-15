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
function isAbbreviatedVerkey (verkey) {
  return verkey.match(/~.*/)
}

function composeFullVerkey (did, abbreviatedVerkey) {
  let withoutAmpersand = abbreviatedVerkey.substring(1, abbreviatedVerkey.length)
  return `${did}${withoutAmpersand}`
}

module.exports.isAbbreviatedVerkey = isAbbreviatedVerkey
module.exports.composeFullVerkey = composeFullVerkey
module.exports.getSchemaLedgerId = getSchemaLedgerId
module.exports.parseSchemaId = parseSchemaId
