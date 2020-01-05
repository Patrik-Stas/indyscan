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

class HomePage extends Component {
  static async getInitialProps ({ req, query }) {
    const baseUrl = getBaseUrl(req)
    const { network } = query
    const networkDetails = await getNetwork(baseUrl, network)
    const domainIndyscanTxs = await getTxs(baseUrl, network, 'domain', 0, 13, [], 'indyscan')
    const poolIndyscanTxs = await getTxs(baseUrl, network, 'pool', 0, 13, [], 'indyscan')
    const configIndyscanTxs = await getTxs(baseUrl, network, 'config', 0, 13, [], 'indyscan')
    const versionRes = await fetch(`${baseUrl}/version`)
    const version = (await versionRes.json()).version
    return {
      networkDetails,
      network,
      domainIndyscanTxs,
      poolIndyscanTxs,
      configIndyscanTxs,
      baseUrl,
      version
    }
  }

  calculateTimeSinceLastTransaction = function calculateTimeSinceLastTransaction (txs) {
    const timestamps = txs.map(tx => (tx && tx.txnMetadata) ? (Date.parse(tx.txnMetadata.txnTime) / 1000) : undefined).filter(t => !!t)
    const utimeMaxTx = Math.max(...timestamps)
    const utimeNow = Math.floor(new Date() / 1000)
    return secondsToDhms(utimeNow - utimeMaxTx)
  }

  render () {
    const { network, networkDetails, baseUrl, domainIndyscanTxs, poolIndyscanTxs, configIndyscanTxs } = this.props
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
              <h4>Last tx {this.calculateTimeSinceLastTransaction(domainIndyscanTxs)} ago</h4>
            </GridRow>
            <GridRow centered style={{ marginTop: '2em' }}>
              <Grid.Column>
                <TxPreviewList indyscanTxs={domainIndyscanTxs} network={network} subledger='domain' />
              </Grid.Column>
            </GridRow>
          </GridColumn>
          <GridColumn width={6} align='center'>
            <GridRow align='left'>
              <h2>Pool txs</h2>
              <h4>Last tx {this.calculateTimeSinceLastTransaction(poolIndyscanTxs)} ago</h4>
            </GridRow>
            <GridRow centered style={{ marginTop: '2em' }}>
              <Grid.Column>
                <TxPreviewList indyscanTxs={poolIndyscanTxs} network={network} subledger='pool' />
              </Grid.Column>
            </GridRow>
          </GridColumn>
          <GridColumn width={5} align='right'>
            <GridRow align='left'>
              <h2>Config txs</h2>
              <h4>Last tx {this.calculateTimeSinceLastTransaction(configIndyscanTxs)} ago</h4>
            </GridRow>
            <GridRow centered style={{ marginTop: '2em' }}>
              <Grid.Column>
                <TxPreviewList indyscanTxs={configIndyscanTxs} network={network} subledger='config' />
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
