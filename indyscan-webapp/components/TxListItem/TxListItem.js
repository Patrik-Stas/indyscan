import React, { Component } from 'react'
import './TxListItem.scss'
import { TableCell, TableRow } from 'semantic-ui-react'
import Link from 'next/link'
import ReactTooltip from 'react-tooltip'
import { getTxLinkData } from '../../routing'
import { extractTxDataBasic, extractTxDataDetailsHumanReadable } from '../../txtools'
import { renderKeyValuesAsBadges } from '../Common'
import top100 from '../palettes'

function filterTxDetails (keyValues) {
  let keys = Object.keys((keyValues))
  let result = {}
  for (const key of keys) {
    if (!Array.isArray(keyValues[key])) {
      result[key] = keyValues[key]
    }
  }
  return result
}

const palette = top100()[7]

class TxListItem extends Component {
  render () {
    console.log(`rendering transaction ${this.props.txn}`)
    const { baseUrl, description, ledger, network, txn } = this.props
    const { seqNo, txnTimeIso8601, typeName, from } = extractTxDataBasic(txn)
    const data = extractTxDataDetailsHumanReadable(txn, 5)
    const { href, as } = getTxLinkData(baseUrl, network, ledger, seqNo)
    const filteredData = filterTxDetails(data)
    return (
      <TableRow className='txListItem' style={{ fontSize: '0.8em', height: '100%' }}>
        <TableCell><Link href={href} as={as}><a>{seqNo}</a></Link></TableCell>
        <TableCell>
          <ReactTooltip />
          <p data-tip={description}>{typeName}</p>
        </TableCell>
        <TableCell>{`${(txnTimeIso8601 ? new Date(txnTimeIso8601) : 'Genesis tx').toLocaleString('en-GB')}`}</TableCell>
        <TableCell>{from}</TableCell>
        <TableCell>{renderKeyValuesAsBadges(seqNo, filteredData, palette[2])}</TableCell>
      </TableRow>
    )
  }
}
export default TxListItem
