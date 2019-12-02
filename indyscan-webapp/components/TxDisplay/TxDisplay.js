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
      {Array.isArray(value) ? renderAsBadges(key, value) : <Label>{value}</Label>}
    </List.Item>
  )
}

function renderKeyValues (obj, groupId) {
  let items = []
  let i = 0
  for (let [key, value] of Object.entries(obj)) {
    items.push(renderKeyValuePair(key, value, `${groupId}-${i}`))
    i++
  }
  return items
}

function basic (txIndyscan) {
  let display = {}
  display['From DID'] = txIndyscan.txn.metadata.from
  display['Tx ID'] = txIndyscan.txnMetadata.txnId
  return display
}

function generateClaimDefDisplay (txIndyscan) {
  let display = {}
  console.log(JSON.stringify(txIndyscan))
  display['Attributes'] = txIndyscan.txn.data.refSchemaAttributes
  display['Schema ID'] = txIndyscan.txn.data.refSchemaId
  display['Schema author DID'] = txIndyscan.txn.data.refSchemaFrom
  display['Schema name'] = txIndyscan.txn.data.refSchemaName
  display['Schema version'] = txIndyscan.txn.data.refSchemaVersion
  display['Schema seqNo'] = txIndyscan.txn.data.refSchemaTxnSeqno
  display['Schema create time'] = txIndyscan.txn.data.refSchemaTxnTime
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
  'NYM': basic,
  'ATTRIB': basic,
  'SCHEMA': basic,
  'CLAIM_DEF': merge(basic, generateClaimDefDisplay),
  'REVOC_REG_DEF': basic,
  'REVOC_REG_ENTRY': basic,
  'SET_CONTEXT': basic,
  'NODE': basic,
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
