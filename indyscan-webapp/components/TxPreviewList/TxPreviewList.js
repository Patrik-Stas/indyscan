import TxPreview from '../TxPreview/TxPreview'
import { extractTxDataBasic } from '../../txtools'
import { ItemGroup } from 'semantic-ui-react'
import React, { Component } from 'react'
import { CSSTransition } from 'react-transition-group'
import './TxPreviewList.scss'

class TxPreviewList extends Component {

  //https://reactjs.org/docs/react-component.html#shouldcomponentupdate
  shouldComponentUpdate (nextProps) {
    const previousTxs = this.props.indyscanTxs
    const nextTxs = nextProps.indyscanTxs
    if (previousTxs && nextTxs && previousTxs[0] && nextTxs[0]) {
      return (previousTxs[0].imeta.seqNo !== nextTxs[0].imeta.seqNo)
    }
    return true
  }

  render () {
    const { indyscanTxs, network, subledger, animateFirst } = this.props
    const firstTx = indyscanTxs[0]
    return (
      <ItemGroup>
        {firstTx &&
        <CSSTransition key={firstTx.imeta.seqNo} appear={animateFirst} in={true} timeout={1000} classNames="txitem">
          <TxPreview key={`preview-${network}-${subledger}-xyz`}
                     indyscanTx={firstTx}
                     network={network}
                     ledger={subledger}/>
        </CSSTransition>
        }
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
