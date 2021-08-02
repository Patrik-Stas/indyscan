import React from 'react'
import './TxDisplay.scss'
import {
  Button,
  GridRow, Icon,
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemMeta,
  List
} from 'semantic-ui-react'
import { converTxDataBasicToHumanReadable, extractTxDataBasic, extractTxDataDetailsHumanReadable, } from '../../txtools'
import TimeAgoText from '../TimeAgoText/TimeAgoText'
import { BadgedValueDisplay } from '../BadgedValueDisplay/BadgedValueDisplay'



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
                <BadgedValueDisplay obj={keyValBasicHumanReadable} groupId='txbasic' color='blue'/>
                <BadgedValueDisplay obj={keyValTxDetailsHumanReadable} groupId='txdetails' color='green'/>
              </List>
            </ItemDescription>
          </ItemContent>
        </Item>
      </ItemGroup>
    </GridRow>
  )
}

export default TxDisplay
