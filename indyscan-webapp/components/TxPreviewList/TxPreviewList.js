import TxPreview from '../TxPreview/TxPreview'
import { extractTxDataBasic } from '../../txtools'
import { ItemGroup } from 'semantic-ui-react'
import React, { Component } from 'react'
import { CSSTransition } from 'react-transition-group'
import './TxPreviewList.scss'

class TxPreviewList extends Component {

  //https://reactjs.org/docs/react-component.html#shouldcomponentupdate
  shouldComponentUpdate (nextProps) {
    return (this.props.indyscanTxs[0].imeta.seqNo !== nextProps.indyscanTxs[0].imeta.seqNo)
  }

  render () {
    const { indyscanTxs, network, subledger, animateFirst } = this.props
    const firstTx = indyscanTxs[0]
    const firstTxSeqNo = firstTx.imeta.seqNo
    console.log(firstTxSeqNo)
    return (
      <ItemGroup>
        <CSSTransition key={firstTxSeqNo} appear={animateFirst} in={true} timeout={1000} classNames="txitem">
          <TxPreview key={`preview-${network}-${subledger}-xyz`}
                     indyscanTx={firstTx}
                     network={network}
                     ledger={subledger}/>
        </CSSTransition>
        {
          indyscanTxs.slice(1).map((indyscanTx, index) => {
            const { seqNo } = extractTxDataBasic(indyscanTx)
            return (
              <TxPreview key={`preview-${network}-${subledger}-${seqNo}`}
                         indyscanTx={indyscanTx}
                         network={network}
                         ledger={subledger}/>
            )
          })
        }
      </ItemGroup>
    )
  }
}

export default TxPreviewList
