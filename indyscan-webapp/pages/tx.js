import '../scss/style.scss'
import React, { Component } from 'react'
import { getTx } from 'indyscan-api'
import PageHeader from '../components/PageHeader/PageHeader'
import { Grid, Container, GridRow, GridColumn } from 'semantic-ui-react'
import JSONPretty from 'react-json-pretty'
import top100 from '../components/palettes'
import Link from 'next/link'
import { getTxLinkData } from '../routing'
import Router from 'next/dist/lib/router'
import { getBaseUrl } from '../routing'
import Footer from '../components/Footer/Footer'
import toCanonicalJson from 'canonical-json'

const pageSize = 20

class Tx extends Component {

  static async getInitialProps ({req, query}) {
    const {network, ledger, seqNo} = query
    const baseUrl = getBaseUrl(req)
    let txDetail
    try {
      txDetail = await getTx(baseUrl, network, ledger, seqNo)
    } catch (e) {
      txDetail={error:"This tx was not scanned yet, or something went wrong trying to retrieve it."}
    }
    return {
      baseUrl,
      txDetail,
      network,
      ledger,
      seqNo,
    }
  }

  handleArrowKeys (event) {
    const {baseUrl, network, ledger, seqNo} = this.props
    switch (event.key) {
      case 'ArrowRight': {
        const {href, as} = getTxLinkData(baseUrl, network, ledger, parseInt(seqNo) - 1)
        Router.push(href, as)
        break
      }
      case 'ArrowLeft': {
        const {href, as} = getTxLinkData(baseUrl, network, ledger, parseInt(seqNo) + 1)
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
             border-color:${palette[1]};border-width:1px;padding:4em`,
      key: `color:${palette[1]};`,
      string: `color:${palette[2]};`,
      value: `color:${palette[3]};`,
      boolean: `color:${palette[4]};`,
    }

    const {baseUrl, txDetail, network, ledger, seqNo} = this.props
    const {href: hrefPrev, as: asPrev} = getTxLinkData(baseUrl, network, ledger, parseInt(seqNo) - 1)
    const {href: hrefNext, as: asNext} = getTxLinkData(baseUrl, network, ledger, parseInt(seqNo) + 1)
    return (
      <Grid>
        <GridRow>
          <GridColumn>
            <PageHeader page={ledger || 'home'} network={network} baseUrl={baseUrl}/>
          </GridColumn>
        </GridRow>
        <GridRow>
          <GridColumn width={3} textAlign='center'>
            <Link href={hrefNext
            } as={asNext}><a className="menulink">Next tx</a></Link>
          </GridColumn>
          <GridColumn width={10} textAlign='center'>
            <h4>{`${seqNo}th ${ledger} transaction`}</h4>
          </GridColumn>
          <GridColumn width={3} textAlign='center'>
            <Link href={hrefPrev} as={asPrev}><a className="menulink">Prev tx</a></Link>
          </GridColumn>
        </GridRow>
        <GridRow>
          <GridColumn>
            <Container textAlign='justified'>
              {<JSONPretty theme={mytheme} data={toCanonicalJson(txDetail)}/>}
            </Container>
          </GridColumn>
        </GridRow>
        <GridRow>
          <GridColumn>
            <Footer/>
          </GridColumn>
        </GridRow>
      </Grid>
    )
  }
}

export default Tx
