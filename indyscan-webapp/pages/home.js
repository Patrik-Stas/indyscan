import React, { Component } from 'react'
import '../scss/style.scss'
import { getTransactions, getNetwork } from 'indyscan-api-client'
import { getBaseUrl } from '../routing'
  import { Grid, GridColumn, GridRow } from 'semantic-ui-react'
import PageHeader from '../components/PageHeader/PageHeader'
import TxPreviewList from '../components/TxPreviewList/TxPreviewList'
import Footer from '../components/Footer/Footer'
import fetch from 'isomorphic-fetch'

function secondsToDhms (seconds) {
  seconds = Number(seconds)
  var d = Math.floor(seconds / (3600 * 24))
  var h = Math.floor(seconds % (3600 * 24) / 3600)
  var m = Math.floor(seconds % 3600 / 60)
  var s = Math.floor(seconds % 60)

  var dDisplay = d > 0 ? d + (d === 1 ? ' day, ' : ' days, ') : ''
  var hDisplay = h > 0 ? h + (h === 1 ? ' hour, ' : ' hours, ') : ''
  var mDisplay = m > 0 ? m + (m === 1 ? ' minute, ' : ' minutes, ') : ''
  var sDisplay = s > 0 ? s + (s === 1 ? ' second' : ' seconds') : ''
  return dDisplay + hDisplay + mDisplay + sDisplay
}

class HomePage extends Component {
  static async getInitialProps ({ req, query }) {
    const baseUrl = getBaseUrl(req)
    const { network } = query
    const networkDetails = await getNetwork(baseUrl, network)
    const domainTxs = await getTransactions(baseUrl, network, 'domain', 0, 13)
    const poolTxs = await getTransactions(baseUrl, network, 'pool', 0, 13)
    const configTxs = await getTransactions(baseUrl, network, 'config', 0, 13)
    const versionRes = await fetch(`${baseUrl}/version`)
    const version = (await versionRes.json()).version
    return {
      networkDetails,
      network,
      domainTxs: domainTxs.txs,
      poolTxs: poolTxs.txs,
      configTxs: configTxs.txs,
      baseUrl,
      version
    }
  }

  calculateTimeSinceLastTransaction = function calculateTimeSinceLastTransaction (txs) {
    const timestamps = txs.map(tx => (tx && tx.txnMetadata) ? tx.txnMetadata.txnTime : undefined).filter(t => !!t)
    const utimeMaxTx = Math.max(...timestamps)
    const utimeNow = Math.floor(new Date() / 1000)
    return secondsToDhms(utimeNow - utimeMaxTx)
  }

  render () {
    const { network, networkDetails, baseUrl } = this.props
    console.log(JSON.stringify(networkDetails))
    return (
      <Grid>
        <GridRow style={{ backgroundColor: 'white', marginBottom: '-1em' }}>
          <GridColumn width={16}>
            <PageHeader page='home' network={network} baseUrl={baseUrl} />
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
              <h4>Last tx {this.calculateTimeSinceLastTransaction(this.props.domainTxs)} ago</h4>
            </GridRow>
            <GridRow centered style={{ marginTop: '2em' }}>
              <Grid.Column>
                <TxPreviewList txs={this.props.domainTxs} network={network} subledger='domain' />
              </Grid.Column>
            </GridRow>
          </GridColumn>
          <GridColumn width={6} align='center'>
            <GridRow align='left'>
              <h2>Pool txs</h2>
              <h4>Last tx {this.calculateTimeSinceLastTransaction(this.props.poolTxs)} ago</h4>
            </GridRow>
            <GridRow centered style={{ marginTop: '2em' }}>
              <Grid.Column>
                <TxPreviewList txs={this.props.poolTxs} network={network} subledger='pool' />
              </Grid.Column>
            </GridRow>
          </GridColumn>
          <GridColumn width={5} align='right'>
            <GridRow align='left'>
              <h2>Config txs</h2>
              <h4>Last tx {this.calculateTimeSinceLastTransaction(this.props.configTxs)} ago</h4>
            </GridRow>
            <GridRow centered style={{ marginTop: '2em' }}>
              <Grid.Column>
                <TxPreviewList txs={this.props.configTxs} network={network} subledger='config' />
              </Grid.Column>
            </GridRow>
          </GridColumn>

        </GridRow>
        <GridRow>
          <GridColumn>
            <Footer displayVersion={this.props.version} />
          </GridColumn>
        </GridRow>
      </Grid>
    )
  }
}

export default HomePage
