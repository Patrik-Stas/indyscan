import React from 'react'
import './TxDisplay.scss'
import { GridRow, Item, Label, List, Icon, Popup, Button } from 'semantic-ui-react'
import { renderAsBadges } from '../Common'
import {
  converTxDataBasicToHumanReadable,
  extractTxDataBasic,
  extractTxDataDetailsHumanReadable,
  secondsToDhms
} from '../../txtools'

function renderKeyValuePair (key, value, keyValueId, color='red') {
  return (
    <List.Item key={keyValueId}>
      <Label color={color} horizontal>
        {key}
      </Label>
      {Array.isArray(value) ? renderAsBadges(key, value) : <Label>{value.toString().trim()}</Label>}
    </List.Item>
  )
}

function renderKeyValues (obj, groupId, color) {
  let items = []
  let i = 0
  for (let [key, value] of Object.entries(obj)) {
    if (value) {
      if (Array.isArray(value) && value.length > 0) {
        items.push(renderKeyValuePair(key, value, `${groupId}-${i}`, color))
      } else {
        let stringified = value.toString().trim()
        if (stringified) {
          items.push(renderKeyValuePair(key, value, `${groupId}-${i}`, color))
        } else {
          continue
        }
      }
      i++
    }
  }
  return items
}

function calculateTimeSinceTx (time) {
  const timestamp = (Date.parse(time) / 1000)
  const utimeNow = Math.floor(new Date() / 1000)
  return secondsToDhms(utimeNow - timestamp)
}

function renderTimeAgoText (txnTimeIso8601) {
  if (txnTimeIso8601 === undefined) {
    return "Genesis"
  } else return calculateTimeSinceTx(txnTimeIso8601)

}

const TxDisplay = ({ txIndyscan, txLedger }) => {
  const keyValTxDetailsHumanReadable = extractTxDataDetailsHumanReadable(txIndyscan)
  const keyValTxBasic = extractTxDataBasic(txIndyscan)
  const { txnId, seqNo, txnTimeIso8601, typeName, rootHash, from } = keyValTxBasic // eslint-disable-line
  const keyValBasicHumanReadable = converTxDataBasicToHumanReadable(keyValTxBasic)
  // const displayKeyValues = Object.assign(keyValBasicHumanReadable, keyValTxDetailsHumanReadable)
  return (
    <GridRow>
      <Item.Group>
        <Item>
          <Item.Content>
            <Item.Header>{typeName}</Item.Header>
            <Item.Meta>{renderTimeAgoText(txnTimeIso8601)}</Item.Meta>
            <Item.Description>
              <List divided>
                {renderKeyValues(keyValBasicHumanReadable, 'txbasic', 'blue')}
                {renderKeyValues(keyValTxDetailsHumanReadable, 'txdetails', 'green')}
              </List>
            </Item.Description>
          </Item.Content>
        </Item>
      </Item.Group>
    </GridRow>
  )
}

export default TxDisplay
