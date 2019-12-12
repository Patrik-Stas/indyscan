import React, { Component } from 'react'
import './TxListItem.scss'
import { TableCell, TableRow } from 'semantic-ui-react'
import Link from 'next/link'
import ReactTooltip from 'react-tooltip'
import { getTxLinkData } from '../../routing'
import { extractTxDataBasic } from '../../txtools'

class TxListItem extends Component {
  render () {
    const { baseUrl, description, ledger, network, txn } = this.props
    const { txnId, seqNo, txnTimeIso8601, typeName, from } = extractTxDataBasic(txn)
    const { href, as } = getTxLinkData(baseUrl, network, ledger, seqNo)
    return (
      <TableRow className='txListItem' style={{ fontSize: '0.8em', height: '100%' }}>
        <TableCell><Link href={href} as={as}><a>{seqNo}</a></Link></TableCell>
        <TableCell>
          <ReactTooltip />
          <p data-tip={description}>{typeName}</p>
        </TableCell>
        <TableCell>{`${(new Date(txnTimeIso8601)).toLocaleString('en-GB')} UTC`}</TableCell>
        <TableCell>{from}</TableCell>
        <TableCell>{txnId}</TableCell>
      </TableRow>
    )
  }
}
export default TxListItem
