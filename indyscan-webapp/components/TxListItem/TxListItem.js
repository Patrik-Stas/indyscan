import React, { Component } from 'react'
import './TxListItem.scss'
import { Label, List, TableCell, TableRow } from 'semantic-ui-react'
import Link from 'next/link'
import ReactTooltip from 'react-tooltip'
import { getTxLinkData } from '../../routing'
import { extractTxDataBasic, extractTxDataDetailsHumanReadable } from '../../txtools'
import { renderKeyValuesAsBadges, renderValuesAsBadges } from '../Common'
import top100 from '../palettes'

function filterTxDetails(keyValues) {
  let keys = Object.keys((keyValues))
  let result = {}
  for (const key of keys) {
    if (!Array.isArray(keyValues[key])) {
      result[key] = keyValues[key]
    }
  }
  return result
}


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
//
// function renderKeyValuePairs(keyValues) {
//     for (const [key, value] of Object.entries(keyValues)) {
//       renderKeyValuePair()
//     }
// }

const palette = top100()[7]

class TxListItem extends Component {
  render () {
    const { baseUrl, description, ledger, network, txn } = this.props
    const { txnId, seqNo, txnTimeIso8601, typeName, from } = extractTxDataBasic(txn)
    const data = extractTxDataDetailsHumanReadable(txn, 5)
    const { href, as } = getTxLinkData(baseUrl, network, ledger, seqNo)
    const filteredData = filterTxDetails(data)
    const badges1 = renderKeyValuesAsBadges(seqNo, filteredData, palette[2])
    // console.log(badges1)
    return (
      <TableRow className='txListItem'  style={{ fontSize: '0.8em', height: '100%' }}>
        <TableCell><Link href={href} as={as}><a>{seqNo}</a></Link></TableCell>
        <TableCell>
          <ReactTooltip />
          <p data-tip={description}>{typeName}</p>
        </TableCell>
        <TableCell>{`${(new Date(txnTimeIso8601)).toLocaleString('en-GB')}`}</TableCell>
        <TableCell>{from}</TableCell>
        <TableCell>{badges1}</TableCell>
        {/*<TableCell>{JSON.stringify(filteredData)}</TableCell>*/}
        {/*<TableCell>{filteredData}</TableCell>*/}
        {/*<TableCell>{JSON.stringify(data)}</TableCell>*/}
        {/*<TableCell>{<Label>foobar</Label>}</TableCell>*/}
      </TableRow>
    )
  }
}
export default TxListItem
