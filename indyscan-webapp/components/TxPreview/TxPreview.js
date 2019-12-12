import React, { Component } from 'react'
import './TxPreview.scss'
import { Item } from 'semantic-ui-react'
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
      <Item style={{ marginBottom: '2em' }}>
        <Item.Image size='tiny'>
          <Link href={href} as={as}><a><span style={{ fontSize: '2.5em' }}>{seqNo}</span></a></Link>
        </Item.Image>
        <Item.Content>
          <Item.Header>{typeName}</Item.Header>
          <Item.Meta>{`${(new Date(txnTimeIso8601)).toLocaleString('en-GB')} UTC`}</Item.Meta>
          <Item.Description>From: {fromDidDisplayed}</Item.Description>
        </Item.Content>
      </Item>

    )
  }
}

export default TxPreview
