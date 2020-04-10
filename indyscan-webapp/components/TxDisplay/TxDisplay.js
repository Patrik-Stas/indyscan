import React from 'react'
import './TxDisplay.scss'
import {
  GridRow,
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemMeta,
  Label,
  List
} from 'semantic-ui-react'
import { renderValuesAsBadges } from '../Common'
import { converTxDataBasicToHumanReadable, extractTxDataBasic, extractTxDataDetailsHumanReadable, } from '../../txtools'
import TimeAgoText from '../TimeAgoText/TimeAgoText'

function renderKeyValuePair (key, value, keyValueId, color = 'red') {
  return (
    <List.Item key={keyValueId}>
      <Label color={color} horizontal>
        {key}
      </Label>
      {Array.isArray(value) ? renderValuesAsBadges(key, value) : <Label>{value.toString().trim()}</Label>}
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

const TxDisplay = ({ txIndyscan, txLedger }) => {
  const keyValTxDetailsHumanReadable = extractTxDataDetailsHumanReadable(txIndyscan)
  const keyValTxBasic = extractTxDataBasic(txIndyscan)
  const { txnTimeIso8601, typeName } = keyValTxBasic // eslint-disable-line
  const keyValBasicHumanReadable = converTxDataBasicToHumanReadable(keyValTxBasic)
  return (
    <GridRow>
      <ItemGroup>
        <Item>
          <ItemContent>
            <ItemHeader>{typeName} TX</ItemHeader>
            <ItemMeta><TimeAgoText sinceEpoch={new Date(txnTimeIso8601)} className='txdisplay-graytext'/></ItemMeta>
            <ItemDescription>
              <List divided>
                {renderKeyValues(keyValBasicHumanReadable, 'txbasic', 'blue')}
                {renderKeyValues(keyValTxDetailsHumanReadable, 'txdetails', 'green')}
              </List>
            </ItemDescription>
          </ItemContent>
        </Item>
      </ItemGroup>
    </GridRow>
  )
}

export default TxDisplay
