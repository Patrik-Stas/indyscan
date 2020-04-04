import React, { Component } from 'react'
import './TxPreview.scss'
import Link from 'next/link'
import { extractTxDataBasic } from '../../txtools'
// import moment from 'moment'
import moment from 'moment-timezone'

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
    const localTime = moment.utc(txnTimeIso8601).tz(moment.tz.guess()).format('do MMMM YYYY, HH:mm:ss a')
    // const utcTime = moment.utc(txnTimeIso8601).format('do MMMM YYYY, H:mm:ss')
    return (

      <div className="txitem data-content">
        <div style={{ fontSize: '1.2em'}}>
          <Link href={href} as={as}>
            <a><span style={{ marginRight: '0.4em', marginBottom: '0.2em' }}>{seqNo}</span></a>
          </Link>
          <span>{typeName}</span>
        </div>
        <div style={{ marginTop: '0.6em', fontSize: '0.85em' }}>
          <span style={{ display: 'block', marginBottom: '0.1em' }}><b>Local Time:</b> {localTime}</span>
          <span style={{ display: 'block' }}><b>From  DID: </b>{fromDidDisplayed}</span>
        </div>
      </div>

    )
  }
}

export default TxPreview
