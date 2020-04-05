import React, { Component } from 'react'
import '../scss/style.scss'
import { getNetwork, getTxs } from 'indyscan-api-client'
import { getBaseUrl } from '../routing'
import { Grid, GridColumn, GridRow } from 'semantic-ui-react'
import PageHeader from '../components/PageHeader/PageHeader'
import TxPreviewList from '../components/TxPreviewList/TxPreviewList'
import Footer from '../components/Footer/Footer'
import fetch from 'isomorphic-fetch'
import _ from 'lodash'
import { CSSTransition } from 'react-transition-group'
import { CircularProgressbar } from 'react-circular-progressbar'
import util from 'util'
import getWebsocketClient from '../context/socket-client'
import NetworkInfo from '../components/NetworkInfo/NetworkInfo'
import { SemipolarSpinner } from 'react-epic-spinners'
import SubledgerHeader from '../components/SubledgerHeader/SubledgerHeader'

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

  onTxProcessed (payload) {
    this.setState({ animateFirst: true })
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

  onRescanScheduled (payload) {
    const { workerData: { subledger }, msTillRescan } = payload
    const rescanStart = Math.round((new Date()).getTime())
    const rescanDone = rescanStart + Math.round(msTillRescan)
    if (subledger === 'domain') {
      this.setState({ domainRescanStart: rescanStart, domainRescanDone: rescanDone })
    }
    if (subledger === 'pool') {
      this.setState({ poolRescanStart: rescanStart, poolRescanDone: rescanDone })
    }
    if (subledger === 'config') {
      this.setState({ configRescanStart: rescanStart, configRescanDone: rescanDone })
    }
  }

  getPercentage (rescanStart, rescanDone) {
    const now = Math.round((new Date()).getTime())
    const totalDuration = rescanDone - rescanStart
    const timePassed = now - rescanStart
    return (timePassed / totalDuration) * 100
  }

  areWebsocketsAvailable () {
    // return (this.props.networkDetails && this.props.networkDetails.websocketsUrl)
    return true
  }

  recalcProgress () {
    const { domainRescanStart, domainRescanDone } = this.state
    const { poolRescanStart, poolRescanDone } = this.state
    const { configRescanStart, configRescanDone } = this.state
    this.setState({ scanProgressDomain: this.getPercentage(domainRescanStart, domainRescanDone) })
    this.setState({ scanProgressPool: this.getPercentage(poolRescanStart, poolRescanDone) })
    this.setState({ scanProgressConfig: this.getPercentage(configRescanStart, configRescanDone) })
  }

  componentWillReceiveProps (newProps) {
    this.setState({ domainExpansionTxs: newProps.domainExpansionTxs })
    this.setState({ poolExpansionTxs: newProps.poolExpansionTxs })
    this.setState({ configExpansionTxs: newProps.configExpansionTxs })
    this.setState({ animateFirst: false })
    const { websocketsUrl } = newProps.networkDetails
    const socket = getWebsocketClient(websocketsUrl)
    if (socket) {
      socket.on('connection', function (_socket) {
        logger.info(`app.js WS connection established.`)
      })

      socket.off('rescan-scheduled')
      socket.off('tx-processed')
      socket.off('switched-room-notification')

      socket.on('rescan-scheduled', this.onRescanScheduled.bind(this))
      socket.on('tx-processed', this.onTxProcessed.bind(this))
      socket.on('switched-room-notification', (payload) => console.log(`switched-room-notification: ${JSON.stringify(payload)}`))
    }
  }

  componentDidMount () {
    this.interval = setInterval(this.recalcProgress.bind(this), 350)
  }

  componentWillUnmount () {
    clearInterval(this.interval)
  }

  render () {
    const { network, networkDetails, baseUrl } = this.props
    const { domainExpansionTxs, poolExpansionTxs, configExpansionTxs } = this.state
    const { scanProgressDomain, scanProgressPool, scanProgressConfig } = this.state
    return (
      <div>
        <Grid>
          <GridRow style={{ backgroundColor: 'white', marginBottom: '-1em' }}>
            <GridColumn>
              <PageHeader page='home' network={network} baseUrl={baseUrl}/>
            </GridColumn>
          </GridRow>
        </Grid>
        <NetworkInfo networkDetails={networkDetails}/>
        <CSSTransition key={network} appear={true} in={true} timeout={300}
                       classNames="txsanimation">
          <Grid columns={3} container doubling stackable>
            <GridRow>
              <GridColumn align='left'>
                <GridRow align='left'>
                  <SubledgerHeader subledger='Domain' progress={scanProgressDomain}/>
                </GridRow>
                <GridRow centered style={{ marginTop: '2em' }}>
                  <Grid.Column>
                    <TxPreviewList animateFirst={this.state.animateFirst} indyscanTxs={domainExpansionTxs}
                                   network={network} subledger='domain'/>
                  </Grid.Column>
                </GridRow>
              </GridColumn>
              <GridColumn align='center'>
                <GridRow align='left'>
                  <SubledgerHeader subledger='Pool' progress={scanProgressPool}/>
                </GridRow>
                <GridRow centered style={{ marginTop: '2em' }}>
                  <Grid.Column>
                    <TxPreviewList animateFirst={this.state.animateFirst} indyscanTxs={poolExpansionTxs}
                                   network={network} subledger='pool'/>
                  </Grid.Column>
                </GridRow>
              </GridColumn>
              <GridColumn align='right'>
                <GridRow align='left'>
                  <SubledgerHeader subledger='Config' progress={scanProgressConfig}/>
                </GridRow>
                <GridRow centered style={{ marginTop: '2em' }}>
                  <Grid.Column>
                    <TxPreviewList animateFirst={this.state.animateFirst} indyscanTxs={configExpansionTxs}
                                   network={network} subledger='config'/>
                  </Grid.Column>
                </GridRow>
              </GridColumn>
            </GridRow>
          </Grid>
        </CSSTransition>
        <Grid>
          <GridRow>
            <GridColumn>
              <Footer displayVersion={this.props.version}/>
            </GridColumn>
          </GridRow>
        </Grid>
      </div>
    )
  }
}

export default HomePage
