import React, { Component } from 'react'
import './TxListItem.scss'
import { TableCell, TableRow } from 'semantic-ui-react'
import Link from 'next/link'
import ReactTooltip from 'react-tooltip'
import { txTypeToTxName } from 'indyscan-txtype'
import { getTxLinkData } from '../../routing'

class TxListItem extends Component {
  render () {
    const { seqNo, type, timestamp, txnId, rootHash } = this.props.txInfo
    const { baseUrl, description, ledger, network } = this.props
    const { href, as } = getTxLinkData(baseUrl, network, ledger, seqNo)
    const txName = txTypeToTxName(type) || `UnknownTx`
    return (
      <TableRow className='txListItem' style={{ fontSize: '0.8em', height: '100%' }}>
        <TableCell><Link href={href} as={as}><a>{seqNo}</a></Link></TableCell>
        <TableCell>
          <ReactTooltip />
          <p data-tip={description}>{txName}</p>
        </TableCell>
        <TableCell>{timestamp}</TableCell>
        <TableCell>{txnId ? `${txnId.substring(0, 50)} ...` : ''}</TableCell>
        <TableCell>{rootHash}</TableCell>
      </TableRow>
    )
  }
}
export default TxListItem
