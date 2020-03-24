import React, { Component } from 'react'
import '../scss/style.scss'
import { getTxs, getNetwork } from 'indyscan-api-client'
import { getBaseUrl } from '../routing'
import { Grid, GridColumn, GridRow } from 'semantic-ui-react'
import PageHeader from '../components/PageHeader/PageHeader'
import TxPreviewList from '../components/TxPreviewList/TxPreviewList'
import Footer from '../components/Footer/Footer'
import fetch from 'isomorphic-fetch'
import { secondsToDhms } from '../txtools'
import io from 'socket.io-client'
import util from 'util'

class HomePage extends Component {
  static async getInitialProps ({ req, query }) {
    const baseUrl = getBaseUrl(req)
    const { network } = query
    const networkDetails = await getNetwork(baseUrl, network)
    const domainExpansionTxs = await getTxs(baseUrl, network, 'domain', 0, 13, [], 'expansion')
    const poolExpansionTxs = await getTxs(baseUrl, network, 'pool', 0, 13, [], 'expansion')
    const configExpansionTxs = await getTxs(baseUrl, network, 'config', 0, 13, [], 'expansion')
    const versionRes = await fetch(`${baseUrl}/version`)
    const version = (await versionRes.json()).version
    return {
      networkDetails,
      network,
      domainExpansionTxs,
      poolExpansionTxs,
      configExpansionTxs,
      baseUrl,
      version
    }
  }

  constructor(props) {
    super()
    console.log(`CONSTRUCTOR ${JSON.stringify(props)}`)
    this.state = {
      domainExpansionTxs: this.props.domainExpansionTxs,
      poolExpansionTxs: this.props.poolExpansionTxs,
      configExpansionTxs: this.props.configExpansionTxs
    }
  }

  onProcessedTx (txData) {
    // console.log(`New txdata ${JSON.stringify(txData)}`)
    // console.log(`This= ${util.inspect(this)}`)
    console.log(`State= ${JSON.stringify(this.state)}`)
    let txs = this.state.txs
    txs.push(txData)
    this.setState({txs})
  }

  componentDidMount () {
    const websocketsUrl = 'http://localhost:3709'
    console.log(`Connecting to websocket server ${websocketsUrl}`)
    let ioClient = io.connect(websocketsUrl)
    ioClient.on('tx-processed',  this.onProcessedTx.bind(this) )
  }

  calculateTimeSinceLastTransaction = function calculateTimeSinceLastTransaction (expansionTxs) {
    const timestamps = expansionTxs.map(tx => (tx && tx.idata && tx.idata.txnMetadata) ? (Date.parse(tx.idata.txnMetadata.txnTime) / 1000) : undefined).filter(t => !!t)
    const utimeMaxTx = Math.max(...timestamps)
    const utimeNow = Math.floor(new Date() / 1000)
    return secondsToDhms(utimeNow - utimeMaxTx)
  }

  render () {
    const { network, networkDetails, baseUrl, domainExpansionTxs, poolExpansionTxs, configExpansionTxs } = this.props
    return (
      <Grid>
        <GridRow style={{ backgroundColor: 'white', marginBottom: '-1em' }}>
          <GridColumn width={16}>
            <PageHeader page='home' network={network} baseUrl={baseUrl}/>
          </GridColumn>
        </GridRow>
        <GridRow>
          <p>
            {
              (networkDetails.description) &&
              <h3>{networkDetails.description}</h3>
            }
          </p>
        </GridRow>
        <GridRow>
          <GridColumn width={5} align='left'>
            <GridRow align='left'>
              <h2>Domain txs</h2>
              <h4>Last tx {this.calculateTimeSinceLastTransaction(domainExpansionTxs)} ago</h4>
            </GridRow>
            <GridRow centered style={{ marginTop: '2em' }}>
              <Grid.Column>
                <TxPreviewList indyscanTxs={domainExpansionTxs} network={network} subledger='domain'/>
              </Grid.Column>
            </GridRow>
          </GridColumn>
          <GridColumn width={6} align='center'>
            <GridRow align='left'>
              <h2>Pool txs</h2>
              <h4>Last tx {this.calculateTimeSinceLastTransaction(poolExpansionTxs)} ago</h4>
            </GridRow>
            <GridRow centered style={{ marginTop: '2em' }}>
              <Grid.Column>
                <TxPreviewList indyscanTxs={poolExpansionTxs} network={network} subledger='pool'/>
              </Grid.Column>
            </GridRow>
          </GridColumn>
          <GridColumn width={5} align='right'>
            <GridRow align='left'>
              <h2>Config txs</h2>
              <h4>Last tx {this.calculateTimeSinceLastTransaction(configExpansionTxs)} ago</h4>
            </GridRow>
            <GridRow centered style={{ marginTop: '2em' }}>
              <Grid.Column>
                <TxPreviewList indyscanTxs={configExpansionTxs} network={network} subledger='config'/>
              </Grid.Column>
            </GridRow>
          </GridColumn>

        </GridRow>
        <GridRow>
          <GridColumn>
            <Footer displayVersion={this.props.version}/>
          </GridColumn>
        </GridRow>
      </Grid>
    )
  }
}

export default HomePage
