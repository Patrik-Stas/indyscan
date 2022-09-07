import { txTypeToTxName } from 'indyscan-txtype'

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

function extractClassDataRevRegDef (txExpansion) {
  return [
    { priority: 5, label: "Cred definition", value: txExpansion.idata.txn.data.credDefId },
    { priority: 1, label: "Revocation registry tag", value: txExpansion.idata.txn.data.tag },
    { priority: 5, label: "Issuance type", value: txExpansion.idata.txn.data.value.issuanceType },
    { priority: 5, label: "Revocation registry capacity", value: txExpansion.idata.txn.data.value.maxCredNum },
    { priority: 1, label: "Tails hash", value: txExpansion.idata.txn.data.value.tailsHash },
    { priority: 1, label: "Tails location", value: txExpansion.idata.txn.data.value.tailsLocation },
  ]
}

function extractClassDataRevRegEntry (txExpansion) {
  let d = [
    { priority: 1, label: "Revocation registry", value: txExpansion.idata.txn.data.revocRegDefId }
  ]
  if (txExpansion.idata.txn.data.value.issued) {
    let batchSize = txExpansion.idata.txn.data.value.issued.length
    d.push({ priority: 5, label: "Number of affected credentials", value: batchSize })
  }
  if (txExpansion.idata.txn.data.value.revoked) {
    let batchSize = txExpansion.idata.txn.data.value.revoked.length
    d.push({ priority: 5, label: "Number of affected credentials", value: batchSize })
  }
  return d
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
  'REVOC_REG_DEF': extractClassDataRevRegDef,
  'REVOC_REG_ENTRY': extractClassDataRevRegEntry,
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

export function extractTxDataBasic (tx) {
  const { seqNo } = tx.imeta
  let txnId, txnTimeIso8601, typeName, from, indexedFields
  if (tx?.idata?.expansion) {
    typeName = tx.idata.expansion.idata.txn.typeName
    txnId = tx.idata.expansion.idata.txnMetadata.txnId
    const epoch = tx.idata.expansion?.idata?.txnMetadata?.txnTime
    txnTimeIso8601 = epoch ? new Date(epoch).toISOString() : null
    from = tx?.idata?.expansion?.idata?.txn?.metadata?.from || '-'
    indexedFields = true
  } else if (tx?.idata?.json || tx?.idata?.serialized) {
    const deserializedOriginal = JSON.parse(tx?.idata?.json || tx?.idata?.serialized?.idata?.json)
    txnId = deserializedOriginal.txnMetadata.txnId
    const epoch = deserializedOriginal.txnMetadata.txnTime * 1000
    txnTimeIso8601 = epoch ? new Date(epoch).toISOString() : null
    typeName = txTypeToTxName(deserializedOriginal.txn.type)
    from = deserializedOriginal.txn.metadata.from
    indexedFields = false
  } else {
    throw Error("Malformed transaction format, does not contain expansion nor serialized format.")
  }
  return { txnId, seqNo, txnTimeIso8601, typeName, from, indexedFields }
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
