import React from 'react'
import './TxDisplay.scss'
import { GridRow, Item, Label, List } from 'semantic-ui-react'

export function renderAsBadges (id, data) {
  if (!data) {
    return
  }
  let badgeValues = []
  if (Array.isArray(data)) {
    badgeValues = data
  } else {
    const keys = Object.keys(data)
    badgeValues = keys.map(k => { return { [k]: data[k] } })
  }
  let badges = []
  for (let i = 0; i < badgeValues.length; i++) {
    badges.push(<Label key={`lalbel-${id}-${i}`}style={{ margin: 3 }}>{badgeValues[i]}</Label>)
  }
  return badges
}

function renderKeyValuePair (key, value, keyValueId) {
  return (
    <List.Item key={keyValueId}>
      <Label color='red' horizontal>
        {key}
      </Label>
      {Array.isArray(value) ? renderAsBadges(key, value) : <Label>{value.toString().trim()}</Label>}
    </List.Item>
  )
}

function renderKeyValues (obj, groupId) {
  let items = []
  let i = 0
  for (let [key, value] of Object.entries(obj)) {
    if (value) {
      if (Array.isArray(value) && value.length > 0) {
        items.push(renderKeyValuePair(key, value, `${groupId}-${i}`))
      } else {
        let stringified = value.toString().trim()
        if (stringified) {
          items.push(renderKeyValuePair(key, value, `${groupId}-${i}`))
        } else {
          continue
        }
      }
      i++
    }
  }
  return items
}

function basic (txIndyscan) {
  let display = {}
  display['From DID'] = txIndyscan.txn.metadata.from
  display['Tx ID'] = txIndyscan.txnMetadata.txnId
  return display
}
/// // / role verkey alias dest raw(==stringified json) raw.endpoint. raw.endpoint.agent
function generateNymDisplay (txIndyscan) {
  let display = {}
  display['Target DID'] = txIndyscan.txn.data.dest
  display['Role'] = txIndyscan.txn.data.role
  display['Verkey'] = txIndyscan.txn.data.verkey
  display['Alias'] = txIndyscan.txn.data.alias
  if (txIndyscan.txn.data.raw) {
    let parsedRaw
    try {
      parsedRaw = JSON.parse(txIndyscan.txn.data.raw)
      if (parsedRaw['endpoint']) {
        display['Endpoint.xdi'] = parsedRaw['endpoint']['xdi']
        display['Endpoint.agent'] = parsedRaw['endpoint']['agent']
      } else {
        Object.assign(display, parsedRaw)
      }
    } catch (e) {
      display['Raw'] = txIndyscan.txn.data.raw
    }
  }
  return display
}

function generateSchemaDisplay (txIndyscan) {
  let display = {}
  display['Attributes'] = txIndyscan.txn.data.data.attr_names
  display['Schema name'] = txIndyscan.txn.data.data.name
  display['Schema version'] = txIndyscan.txn.data.data.version
  return display
}

function generateClaimDefDisplay (txIndyscan) {
  let display = {}
  display['Attributes'] = txIndyscan.txn.data.refSchemaAttributes
  display['Schema ID'] = txIndyscan.txn.data.refSchemaId
  display['Schema author DID'] = txIndyscan.txn.data.refSchemaFrom
  display['Schema name'] = txIndyscan.txn.data.refSchemaName
  display['Schema version'] = txIndyscan.txn.data.refSchemaVersion
  display['Schema seqNo'] = txIndyscan.txn.data.refSchemaTxnSeqno
  display['Schema create time'] = txIndyscan.txn.data.refSchemaTxnTime
  return display
}

function generateNodeDisplay (txIndyscan) {
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

function merge (f1, f2) {
  return function (txIndyscan) {
    let o1 = f1(txIndyscan)
    let o2 = f2(txIndyscan)
    Object.assign(o1, o2)
    return o1
  }
}

const txKeyValueDisplayGenerators = {
  'NYM': merge(basic, generateNymDisplay),
  'ATTRIB': merge(basic, generateNymDisplay),
  'SCHEMA': merge(basic, generateSchemaDisplay),
  'CLAIM_DEF': merge(basic, generateClaimDefDisplay),
  'REVOC_REG_DEF': basic,
  'REVOC_REG_ENTRY': basic,
  'SET_CONTEXT': basic,
  'NODE': merge(basic, generateNodeDisplay),
  'POOL_UPGRADE': basic,
  'NODE_UPGRADE': basic,
  'POOL_CONFIG': basic,
  'AUTH_RULE': basic,
  'AUTH_RULES': basic,
  'TXN_AUTHOR_AGREEMENT': basic,
  'TXN_AUTHOR_AGREEMENT_AML': basic,
  'SET_FEES': basic,
  'UNKNOWN': basic
}

const TxDisplay = ({ txIndyscan, txLedger }) => {
  let keyValueGenerator = txKeyValueDisplayGenerators[txIndyscan.txn.typeName] || basic
  let txDisplayKeyValues = keyValueGenerator(txIndyscan)
  return (
    <GridRow>
      <Item.Group>
        <Item>
          <Item.Content>
            <Item.Header>{txIndyscan.txn.typeName}</Item.Header>
            <Item.Meta>{txIndyscan.txnMetadata.txnTime}</Item.Meta>
            <Item.Description>
              <List divided selection>
                {renderKeyValues(txDisplayKeyValues)}
              </List>
            </Item.Description>
          </Item.Content>
        </Item>
      </Item.Group>
    </GridRow>
  )
}

export default TxDisplay
