import React, { Component } from 'react'
import './TxListItem.scss'
import { TableCell, TableRow } from 'semantic-ui-react'
import Link from 'next/link'
import ReactTooltip from 'react-tooltip'
import { getTxLinkData } from '../../routing'
import { extractTxDataBasic, extractTxDataDetailsHumanReadable } from '../../txtools'
import { renderKeyValuesAsBadges } from '../Common'
import top100 from '../palettes'
import moment from 'moment'
import TimeAgoText from '../TimeAgoText/TimeAgoText'

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
    const { baseUrl, description, ledger, network, txn } = this.props
    const { seqNo, txnTimeIso8601, typeName, from } = extractTxDataBasic(txn)
    const { href, as } = getTxLinkData(baseUrl, network, ledger, seqNo)
    let filteredData
    const txExpansionFormat = txn?.idata?.expansion
    if (txExpansionFormat) {
      const data = extractTxDataDetailsHumanReadable(txExpansionFormat, 5)
      filteredData = filterTxDetails(data)
    }
    return (
      <TableRow className='txListItem' style={{ fontSize: '0.8em', height: '100%' }}>
        <TableCell><Link href={href} as={as}><a>{seqNo}</a></Link></TableCell>
        <TableCell>
          <ReactTooltip />
          <p data-tip={description}>{typeName}</p>
        </TableCell>
        <TableCell style={{ overflow: 'hidden', width:'30em'}}>
          <span>
          {`${(txnTimeIso8601 ? moment.utc(txnTimeIso8601).format('DD MMMM YYYY, H:mm:ss') : 'Genesis tx').toLocaleString('en-GB')}`}
          </span>
          <br/>
          <TimeAgoText sinceEpoch={new Date(txnTimeIso8601)} className='txlistitem-graytext'/>
        </TableCell>
        <TableCell>{from}</TableCell>
        <TableCell>{filteredData && renderKeyValuesAsBadges(seqNo, filteredData, palette[2])}</TableCell>
      </TableRow>
    )
  }
}
export default TxListItem
