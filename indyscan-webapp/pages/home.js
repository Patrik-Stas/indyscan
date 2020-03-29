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
import _ from 'lodash'

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

  constructor (props) {
    console.log(`HOME constructor`)
    super()
    this.state = {
      domainExpansionTxs: props.domainExpansionTxs,
      poolExpansionTxs: props.poolExpansionTxs,
      configExpansionTxs: props.configExpansionTxs
    }
  }

  addNewDomainTx (txData) {
    let domainExpansionTxs = _.cloneDeep(this.state.domainExpansionTxs)
    domainExpansionTxs.unshift(txData)
    if (domainExpansionTxs.length > 10) {
      domainExpansionTxs.pop()
    }
    this.setState({ domainExpansionTxs })
  }

  addNewConfigTx (txData) {
    let configExpansionTxs = _.cloneDeep(this.state.configExpansionTxs)
    configExpansionTxs.unshift(txData)
    if (configExpansionTxs.length > 10) {
      configExpansionTxs.pop()
    }
    this.setState({ configExpansionTxs })
  }

  addNewPoolTx (txData) {
    let poolExpansionTxs = _.cloneDeep(this.state.poolExpansionTxs)
    poolExpansionTxs.unshift(txData)
    if (poolExpansionTxs.length > 10) {
      poolExpansionTxs.pop()
    }
    this.setState({ poolExpansionTxs })
  }

  onProcessedTx (payload) {
    // const {workerData, txData} = payload
    const { txData } = payload
    if (txData.imeta.subledger === 'domain') {
      this.addNewDomainTx(txData)
    }
    if (txData.imeta.subledger === 'pool') {
      this.addNewPoolTx(txData)
    }
    if (txData.imeta.subledger === 'config') {
      this.addNewConfigTx(txData)
    }
  }

  onRescanScheduled (txData) {
    const { workerData: { subledger }, msTillRescan } = txData
    console.log(`Rescheduled ${subledger} until ${msTillRescan}`)
  }

  componentWillReceiveProps (newProps) {
    this.setState({ domainExpansionTxs: newProps.domainExpansionTxs })
    this.setState({ configExpansionTxs: newProps.configExpansionTxs })
    this.setState({ poolExpansionTxs: newProps.poolExpansionTxs })
  }

  refreshTimesSinceLast () {
    const { domainExpansionTxs, poolExpansionTxs, configExpansionTxs } = this.state
    const sinceLastDomain = this.calculateTimeSinceLastTransaction(domainExpansionTxs)
    const sinceLastPool = this.calculateTimeSinceLastTransaction(poolExpansionTxs)
    const sinceLastConfig = this.calculateTimeSinceLastTransaction(configExpansionTxs)
    this.setState({ sinceLastDomain })
    this.setState({ sinceLastPool })
    this.setState({ sinceLastConfig })
  }

  componentDidMount () {
    console.log(`HOME componentDidMount`)
    const websocketsUrl = 'http://localhost:3709'
    const namespace = this.props.networkDetails.id
    const websocketTarget = `${websocketsUrl}/${namespace}`
    console.log(`Connecting to websocket server ${websocketTarget}`)
    let ioClient = io.connect(websocketTarget)

    ioClient.on('connection', function (_socket) {
      logger.info(`New connection at namespace`)
    })

    ioClient.on('rescan-scheduled', this.onRescanScheduled.bind(this))
    ioClient.on('tx-processed', this.onProcessedTx.bind(this))

    this.refreshTimesSinceLast()
    this.interval = setInterval(this.refreshTimesSinceLast.bind(this), 1000)
  }

  componentWillUnmount () {
    console.log(`HOME componentWillUnmount`)
    clearInterval(this.interval)
  }

  calculateTimeSinceLastTransaction = function calculateTimeSinceLastTransaction (expansionTxs) {
    const timestamps = expansionTxs.map(tx => (tx && tx.idata && tx.idata.txnMetadata) ? (Date.parse(tx.idata.txnMetadata.txnTime) / 1000) : undefined).filter(t => !!t)
    const utimeMaxTx = Math.max(...timestamps)
    const utimeNow = Math.floor(new Date() / 1000)
    return secondsToDhms(utimeNow - utimeMaxTx)
  }

  render () {
    const { network, networkDetails, baseUrl } = this.props
    const { domainExpansionTxs, poolExpansionTxs, configExpansionTxs } = this.state
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
              <h5>Last tx {this.state.sinceLastDomain} ago</h5>
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
              <h5>Last tx {this.state.sinceLastPool} ago</h5>
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
              <h5>Last tx {this.state.sinceLastConfig} ago</h5>
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
