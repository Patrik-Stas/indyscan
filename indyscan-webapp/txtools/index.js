function extractClassDataNym (txExpansion) {
  return [
    { priority: 5, label: 'Target DID', value: txExpansion.idata.txn.data.dest },
    { priority: 5, label: 'Role change', value: txExpansion.idata.txn.data.roleName },
    { priority: 5, label: 'Verkey', value: txExpansion.idata.txn.data.verkey },
    { priority: 5, label: 'Alias', value: txExpansion.idata.txn.data.alias },
    { priority: 5, label: 'Endpoint', value: txExpansion.idata.txn.data.endpoint },
    { priority: 1, label: 'Last Updated', value: txExpansion.idata.txn.data.lastUpdated },
    { priority: 1, label: 'Raw', value: txExpansion.idata.txn.data.raw }
  ]
}

function extractClassDataSchema (txExpansion) {
  return [
    { priority: 5, label: 'Schema name', value: txExpansion.idata.txn.data.data.name },
    { priority: 5, label: 'Schema version', value: txExpansion.idata.txn.data.data.version },
    { priority: 1, label: 'Attributes', value: txExpansion.idata.txn.data.data.attr_names }
  ]
}

function extractClassDataClaimDef (txExpansion) {
  return [
    { priority: 5, label: 'Schema name', value: txExpansion.idata.txn.data.refSchemaName },
    { priority: 5, label: 'Schema version', value: txExpansion.idata.txn.data.refSchemaVersion },
    { priority: 1, label: 'Schema ID', value: txExpansion.idata.txn.data.refSchemaId },
    { priority: 1, label: 'Schema author DID', value: txExpansion.idata.txn.data.refSchemaFrom },
    { priority: 1, label: 'Schema seqNo', value: txExpansion.idata.txn.data.refSchemaTxnSeqno },
    { priority: 1, label: 'Schema create time', value: txExpansion.idata.txn.data.refSchemaTxnTime },
    { priority: 1, label: 'Attributes', value: txExpansion.idata.txn.data.refSchemaAttributes }
  ]
}

function extractClassDataNode (txExpansion) {
  let display = [
    { priority: 1, label: 'Destination', value: txExpansion.idata.txn.data.dest },
    { priority: 1, label: 'Alias', value: txExpansion.idata.txn.data.data.alias }
  ]
  let { data } = txExpansion.idata.txn.data
  if (data.client_ip) {
    display.push({ priority: 1, label: 'Client', value: `${data.client_ip}:${data.client_port}` })
  }
  if (data.client_ip_geo) {
    display.push({
      priority: 1,
      label: 'Client location',
      value: `${data.client_ip_geo.country}, ${data.client_ip_geo.region}, ${data.client_ip_geo.city}`
    })
  }
  if (data.node_ip) {
    display.push({ priority: 1, label: 'Node', value: `${data.node_ip}:${data.node_port}` })
  }
  if (data.client_ip_geo) {
    display.push({
      priority: 1,
      label: 'Node location',
      value: `${data.node_ip_geo.country}, ${data.node_ip_geo.region}, ${data.node_ip_geo.city}`
    })
  }
  return display
}

function empty (txIndyscan) {
  return []
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

export function extractTxDataBasic (txExpansion) {
  const { typeName } = txExpansion.idata.txn
  const { txnId, txnTime: txnTimeIso8601, seqNo } = txExpansion.idata.txnMetadata
  const from = txExpansion.idata.txn.metadata ? txExpansion.idata.txn.metadata.from : 'not-available'
  return { txnId, seqNo, txnTimeIso8601, typeName, from }
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
export function extractTxDataDetailsHumanReadable (txExpansion, minimalPriority = 0) {
  let typeName = txExpansion.idata.txn.typeName
  let extractTxDescriptiveData = txDataDescriptiveExtractors[typeName]
  let entries = (extractTxDescriptiveData) ? extractTxDescriptiveData(txExpansion) : []
  let result = {}
  for (const entry of entries) {
    if (entry.priority >= minimalPriority) {
      result[entry.label] = entry.value
    }
  }
  return result
}

export function secondsToDhms (seconds) {
  seconds = Number(seconds)
  var d = Math.floor(seconds / (3600 * 24))
  var h = Math.floor(seconds % (3600 * 24) / 3600)
  var m = Math.floor(seconds % 3600 / 60)
  var s = Math.floor(seconds % 60)

  var dDisplay = d > 0 ? d + (d === 1 ? ' day, ' : ' days, ') : ''
  var hDisplay = h > 0 ? h + (h === 1 ? ' hour, ' : ' hours, ') : ''
  var mDisplay = m > 0 ? m + (m === 1 ? ' minute, ' : ' mins, ') : ''
  var sDisplay = s > 0 ? s + (s === 1 ? ' second' : ' secs') : ''
  return dDisplay + hDisplay + mDisplay + sDisplay
}

export function secondsSinceIso8601Date (iso8601) {
  const asUtime = Date.parse(iso8601) / 1000
  const utimeNow = Math.floor(new Date() / 1000)
  return secondsToDhms(utimeNow - asUtime)
}
