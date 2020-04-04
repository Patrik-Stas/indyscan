import '../scss/style.scss'
import React, { Component } from 'react'
import { getTx } from 'indyscan-api-client'
import PageHeader from '../components/PageHeader/PageHeader'
import {
  Grid,
  Container,
  GridRow,
  GridColumn, Message
} from 'semantic-ui-react'
import JSONPretty from 'react-json-pretty'
import top100 from '../components/palettes'
import Link from 'next/link'
import Router from 'next/router'
import { getTxLinkData, getBaseUrl } from '../routing'
import Footer from '../components/Footer/Footer'
import toCanonicalJson from 'canonical-json'
import TxDisplay from '../components/TxDisplay/TxDisplay'

class Tx extends Component {
  static async getInitialProps ({ req, query }) {
    const { network, ledger, seqNo } = query
    const baseUrl = getBaseUrl(req)
    let txExpansion
    let txSerialized
    let displayMessage
    try {
      let {idata} = await getTx(baseUrl, network, ledger, seqNo, 'full')
      txExpansion = idata.expansion
      txSerialized = idata.serialized
    } catch (e) {
      displayMessage = <Message negative>
        <Message.Header>This transaction is not yet available</Message.Header>
        <p>Transaction {seqNo} either doesn't exist on ledger or was not yet fully discovered.</p>
      </Message>
    }
    return {
      displayMessage,
      txExpansion,
      baseUrl,
      txSerialized,
      network,
      ledger,
      seqNo
    }
  }

  handleArrowKeys (event) {
    const { baseUrl, network, ledger, seqNo } = this.props
    switch (event.key) {
      case 'ArrowRight': {
        const { href, as } = getTxLinkData(baseUrl, network, ledger, parseInt(seqNo) - 1)
        Router.push(href, as)
        break
      }
      case 'ArrowLeft': {
        const { href, as } = getTxLinkData(baseUrl, network, ledger, parseInt(seqNo) + 1)
        Router.push(href, as)
        break
      }
    }
  }

  componentDidMount () {
    document.addEventListener('keydown', this.handleArrowKeys.bind(this), false)
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.handleArrowKeys.bind(this), false)
  }

  render () {
    const palette = top100()[7]
    const mytheme = {
      main: `line-height:1.3;color:${palette[0]};background:white;overflow:auto;border-style:solid;
             border-color:${palette[1]};border-width:1px;padding:4em;font-family:Lucida Console,Monaco,monospace`,
      key: `color:${palette[1]};`,
      string: `color:${palette[2]};`,
      value: `color:${palette[3]};`,
      boolean: `color:${palette[4]};`
    }

    const { baseUrl, txSerialized, network, ledger, seqNo, txExpansion, displayMessage } = this.props
    const { href: hrefPrev, as: asPrev } = getTxLinkData(baseUrl, network, ledger, parseInt(seqNo) - 1)
    const { href: hrefNext, as: asNext } = getTxLinkData(baseUrl, network, ledger, parseInt(seqNo) + 1)
    return (
      <Grid>
        <GridRow>
          <GridColumn>
            <PageHeader page={ledger || 'home'} network={network} baseUrl={baseUrl} />
          </GridColumn>
        </GridRow>
        <GridRow>
          <GridColumn width={3} textAlign='center'>
            <Link href={hrefNext} as={asNext}><a style={{ fontSize: '1.2em'}}>Next tx</a></Link>
          </GridColumn>
          <GridColumn width={10} textAlign='center'>
            <h4>{`${network} / ${ledger} / ${seqNo}`}</h4>
          </GridColumn>
          <GridColumn width={3} textAlign='center'>
            <Link href={hrefPrev} as={asPrev}><a style={{ fontSize: '1.2em'}}>Prev tx</a></Link>
          </GridColumn>
        </GridRow>
        {displayMessage && displayMessage}
        {txExpansion &&
          <GridRow className="data-content">
            <TxDisplay txIndyscan={txExpansion} txLedger={txSerialized} />
          </GridRow>
        }
        {txExpansion &&
          <GridRow>
            <GridColumn width={3} textAlign='center'/>
            <GridColumn width={10} textAlign='center'>
              <h4>Enriched data</h4>
            </GridColumn>
            <GridColumn width={3} textAlign='center'/>
          </GridRow>
        }
        {txExpansion &&
          <GridRow>
            <GridColumn>
              <Container textAlign='justified'>
                {<JSONPretty theme={mytheme} data={toCanonicalJson(txExpansion.idata)}/>}
              </Container>
            </GridColumn>
          </GridRow>
        }
        {txSerialized &&
          <GridRow>
            <GridColumn width={3} textAlign='center'/>
            <GridColumn width={10} textAlign='center'>
              <h4>Original ledger data</h4>
            </GridColumn>
            <GridColumn width={3} textAlign='center'/>
          </GridRow>
        }
        {txSerialized &&
          <GridRow>
            <GridColumn>
              <Container textAlign='justified'>
                {<JSONPretty theme={mytheme} data={toCanonicalJson(JSON.parse(txSerialized.idata.json))}/>}
              </Container>
            </GridColumn>
          </GridRow>
        }

        <GridRow>
          <GridColumn>
            <Footer />
          </GridColumn>
        </GridRow>
      </Grid>
    )
  }
}

export default Tx
