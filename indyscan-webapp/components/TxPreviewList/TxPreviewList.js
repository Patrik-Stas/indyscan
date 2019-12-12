import TxPreview from '../TxPreview/TxPreview'
import { extractTxDataBasic } from '../../txtools'
import { ItemGroup } from 'semantic-ui-react'
import React, { Component } from 'react'

class TxPreviewList extends Component {
  render () {
    const { indyscanTxs, network, subledger } = this.props
    return (
      <ItemGroup>
        {
          indyscanTxs.map(indyscanTx => {
            const { seqNo } = extractTxDataBasic(indyscanTx)
            return (
              <TxPreview key={`preview-${seqNo}`}
                indyscanTx={indyscanTx}
                network={network}
                ledger={subledger} />
            )
          })
        }
      </ItemGroup>
    )
  }
}

export default TxPreviewList
