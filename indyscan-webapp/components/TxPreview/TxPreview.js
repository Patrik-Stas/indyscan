import React, { Component } from 'react'
import './TxPreview.scss'
import Link from 'next/link'
import { extractTxDataBasic, secondsToDhms } from '../../txtools'
// import moment from 'moment'
import moment from 'moment-timezone'
import TimeAgoText from '../TimeAgoText/TimeAgoText'

const MAX_DID_LENTH = 25

class TxPreview extends Component {

  constructor () {
    super();
    this.state = {}
  }

  render () {
    const { baseUrl, network, ledger, seqNo, txnTimeIso8601, typeName, from } = this.props
    const href = `${baseUrl}/tx?network=${network}&ledger=${ledger}&seqNo=${seqNo}`
    const as = `/tx/${network}/${ledger}/${seqNo}`
    const fromDidDisplayed = from
      ? (from.length < MAX_DID_LENTH) ? from : `${from.substring(0, (MAX_DID_LENTH - 3))}...`
      : 'N/A'
    let txnDateLocalString = "N/A"
    // let utcDateString = "N/A"
    const sinceEpoch = txnTimeIso8601 ? (Date.parse(txnTimeIso8601)) : null
    if (txnTimeIso8601) {
      txnDateLocalString = moment.utc(txnTimeIso8601).tz(moment.tz.guess()).format('do MMMM YYYY, HH:mm:ss a')
      // todo: display this
      // utcDateString = moment.utc(txnTimeIso8601).format('do MMMM YYYY, HH:mm:ss a')
    }
    console.log(`txnTimeIso8601 = ${txnTimeIso8601}, sinceEpoch=${sinceEpoch}`)

    return (

      <div className="txitem data-content">
        <div style={{ fontSize: '1.2em' }}>
          <Link href={href} as={as}>
            <a><span style={{ marginRight: '0.4em', marginBottom: '0.2em' }}>{seqNo}</span></a>
          </Link>
          <span>{typeName}</span>
        </div>
        <div style={{ marginTop: '0.6em', fontSize: '0.85em' }}>
          <span style={{ display: 'block' }}><b>From  DID: </b>{fromDidDisplayed}</span>
          <span style={{ display: 'block', marginBottom: '0.1em' }}><b>Local Time:</b> {txnDateLocalString}</span>
          <TimeAgoText sinceEpoch={sinceEpoch} className='txitem-graytext' style={{ display: 'block' }}/>
        </div>
      </div>

    )
  }
}

export default TxPreview
