import React, { Component } from 'react'
import './TxPreview.scss'
import Link from 'next/link'
import { extractTxDataBasic } from '../../txtools'

const MAX_DID_LENTH = 25

class TxPreview extends Component {

  render () {
    const { baseUrl, network, ledger, indyscanTx } = this.props
    const { seqNo, txnTimeIso8601, typeName, from } = extractTxDataBasic(indyscanTx)
    const href = `${baseUrl}/tx?network=${network}&ledger=${ledger}&seqNo=${seqNo}`
    const as = `/tx/${network}/${ledger}/${seqNo}`
    const fromDidDisplayed = from
      ? (from.length < MAX_DID_LENTH) ? from : `${from.substring(0, (MAX_DID_LENTH - 3))}...`
      : 'n/a'

    return (

      <div className="txitem data-content">
        <Link href={href} as={as}>
          <a><span style={{ fontSize: '1.7em', marginRight: '0.4em', marginBottom: '0.2em' }}>{seqNo}</span></a>
        </Link>
        <span style={{ fontSize: '1.5em' }}>{typeName}</span>
        <span style={{ display: 'block', marginBottom: '0.1em' }}><b>TX Time:</b> {`${(new Date(txnTimeIso8601)).toLocaleString('en-GB')} UTC`}</span>
        <span style={{ display: 'block' }}><b>From DID:</b> {fromDidDisplayed}</span>

      </div>

    )
  }
}

export default TxPreview
