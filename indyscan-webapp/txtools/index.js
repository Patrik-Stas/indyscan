function extractClassDataNym (txIndyscan) {
  let display = {}
  display['Target DID'] = txIndyscan.txn.data.dest
  display['Role'] = txIndyscan.txn.data.role
  display['Verkey'] = txIndyscan.txn.data.verkey
  display['Alias'] = txIndyscan.txn.data.alias
  display['Endpoint'] = txIndyscan.txn.data.endpoint
  if (!txIndyscan.txn.data.endpoint && txIndyscan.txn.data.raw) {
    display['Raw'] = txIndyscan.txn.data.raw
  }
  return display
}

function extractClassDataSchema (txIndyscan) {
  let display = {}
  display['Schema name'] = txIndyscan.txn.data.data.name
  display['Schema version'] = txIndyscan.txn.data.data.version
  display['Attributes'] = txIndyscan.txn.data.data.attr_names
  return display
}

function extractClassDataClaimDef (txIndyscan) {
  let display = {}
  display['Schema name'] = txIndyscan.txn.data.refSchemaName
  display['Schema version'] = txIndyscan.txn.data.refSchemaVersion
  display['Schema ID'] = txIndyscan.txn.data.refSchemaId
  display['Schema author DID'] = txIndyscan.txn.data.refSchemaFrom
  display['Schema seqNo'] = txIndyscan.txn.data.refSchemaTxnSeqno
  display['Schema create time'] = txIndyscan.txn.data.refSchemaTxnTime
  display['Attributes'] = txIndyscan.txn.data.refSchemaAttributes
  return display
}

function extractClassDataNode (txIndyscan) {
  let display = {}
  let { data } = txIndyscan.txn.data
  display['Destination'] = txIndyscan.txn.data.dest
  display['Alias'] = txIndyscan.txn.data.data.alias
  if (data.client_ip) {
    display['Client'] = `${data.client_ip}:${data.client_port}`
  }
  if (data.client_ip_geo) {
    display['Client location'] = `${data.client_ip_geo.country}, ${data.client_ip_geo.region}, ${data.client_ip_geo.city}`
  }
  if (data.node_ip) {
    display['Node'] = `${data.node_ip}:${data.node_port}`
  }
  if (data.client_ip_geo) {
    display['Node location'] = `${data.node_ip_geo.country}, ${data.node_ip_geo.region}, ${data.node_ip_geo.city}`
  }
  return display
}

function empty (txIndyscan) {
  return {}
}

const txDataDescriptiveExtractors = {
  'NYM': extractClassDataNym,
  'ATTRIB': extractClassDataNym,
  'SCHEMA': extractClassDataSchema,
  'CLAIM_DEF': extractClassDataClaimDef,
  'REVOC_REG_DEF': empty,
  'REVOC_REG_ENTRY': empty,
  'SET_CONTEXT': empty,
  'NODE': extractClassDataNode,
  'POOL_UPGRADE': empty,
  'NODE_UPGRADE': empty,
  'POOL_CONFIG': empty,
  'AUTH_RULE': empty,
  'AUTH_RULES': empty,
  'TXN_AUTHOR_AGREEMENT': empty,
  'TXN_AUTHOR_AGREEMENT_AML': empty,
  'SET_FEES': empty,
  'UNKNOWN': empty
}

export function extractTxDataBasic (txIndyscan) {
  const { rootHash } = txIndyscan
  const { typeName } = txIndyscan.txn
  const { txnId, txnTime: txnTimeIso8601, seqNo } = txIndyscan.txnMetadata
  const from = txIndyscan.txn.metadata ? txIndyscan.txn.metadata.from : 'not-available'
  return { txnId, seqNo, txnTimeIso8601, typeName, rootHash, from }
}

export function converTxDataBasicToHumanReadable (txDataBasic) {
  let basicReadable = {}
  basicReadable['TxID'] = txDataBasic.txnId
  basicReadable['Seqno'] = txDataBasic.seqNo
  basicReadable['Tx Time'] = txDataBasic.txnTimeIso8601
  basicReadable['Tx Type'] = txDataBasic.typeName
  basicReadable['RootHash'] = txDataBasic.rootHash
  basicReadable['From DID'] = txDataBasic.from
  return basicReadable
}

/*
The keys of this object are human-readable, may contain space. The keys differ per TX Type and even per individual transactions!
 */
export function extractTxDataDetailsHumanReadable (txIndyscan) {
  let typeName = txIndyscan.txn.typeName
  let extractTxDescriptiveData = txDataDescriptiveExtractors[typeName]
  return (extractTxDescriptiveData) ? extractTxDescriptiveData(txIndyscan) : {}
}

export function secondsToDhms (seconds) {
  seconds = Number(seconds)
  var d = Math.floor(seconds / (3600 * 24))
  var h = Math.floor(seconds % (3600 * 24) / 3600)
  var m = Math.floor(seconds % 3600 / 60)
  var s = Math.floor(seconds % 60)

  var dDisplay = d > 0 ? d + (d === 1 ? ' day, ' : ' days, ') : ''
  var hDisplay = h > 0 ? h + (h === 1 ? ' hour, ' : ' hours, ') : ''
  var mDisplay = m > 0 ? m + (m === 1 ? ' minute, ' : ' minutes, ') : ''
  var sDisplay = s > 0 ? s + (s === 1 ? ' second' : ' seconds') : ''
  return dDisplay + hDisplay + mDisplay + sDisplay
}

export function secondsSinceIso8601Date (iso8601) {
  const asUtime = Date.parse(iso8601) / 1000
  const utimeNow = Math.floor(new Date() / 1000)
  return secondsToDhms(utimeNow - asUtime)
}
