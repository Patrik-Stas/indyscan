import React, { Component } from 'react'
import '../scss/style.scss'
import TxsChart from '../components/TxChart/TxChart'
import { getTransactions, getTxTimeseries, getNetwork } from 'indyscan-api'
import { getBaseUrl } from '../routing'
import { Grid, GridColumn, GridRow } from 'semantic-ui-react'
import PageHeader from '../components/PageHeader/PageHeader'
import TxPreviewList from '../components/TxPreviewList/TxPreviewList'
import Footer from '../components/Footer/Footer'
import IntervalDropdown from '../components/IntervalDropdown/IntervalDropdown'
import fetch from 'isomorphic-fetch'


async function fetchTimeseriesData(baseUrl, network, utimeSince, utimeUntil) {
  const timeseriesDomain = (await getTxTimeseries(baseUrl, network, 'domain', 'auto', utimeSince, utimeUntil)).map(m => [m[0] * 1000, m[1]])
  const timeseriesPool = (await getTxTimeseries(baseUrl, network, 'pool', 'auto', utimeSince, utimeUntil)).map(m => [m[0] * 1000, m[1]])
  const timeseriesConfig = (await getTxTimeseries(baseUrl, network, 'config', 'auto', utimeSince, utimeUntil)).map(m => [m[0] * 1000, m[1]])
  return {timeseriesDomain, timeseriesPool, timeseriesConfig}
}

const secsInDay = 3600 * 24
const secsInWeek = secsInDay * 7

function utimeWeekAgo() {
  const utimeSecNow = Math.floor(new Date() / 1000)
  return (utimeSecNow - secsInWeek)
}

class StatsPage extends Component {

  static async getInitialProps ({ req, query }) {
    const baseUrl = getBaseUrl(req)
    const { network } = query
    const networkDetails = await getNetwork(baseUrl, network)
    const utimeSecNow = Math.floor(new Date() / 1000)
    const {timeseriesDomain, timeseriesPool, timeseriesConfig} = await fetchTimeseriesData(baseUrl, network, utimeWeekAgo(), utimeSecNow)
    return {
      networkDetails,
      network,
      timeseriesDomain,
      timeseriesPool,
      timeseriesConfig,
      baseUrl,
      timerangeSec: secsInWeek
    }
  }

  getTimerangeSec() {
    const fromState = (this.state && this.state.timerangeSec)
    console.log(`Returning timerange from state? ${fromState}`)
    const value = (fromState)
      ? this.state.timerangeSec
      : this.props.timerangeSec
    console.log(`Determined timerange: ${value}`)
    return value
  }

  getTimeseriesRenderData() {
    const renderFromState = ((!!this.state) && (!!this.state.timeseriesDomain) && (!!this.state.timeseriesPool) && (!!this.state.timeseriesConfig))
    console.log(`renderFromState data from state ${renderFromState}`)
    if (renderFromState) {
      const {timeseriesDomain, timeseriesPool, timeseriesConfig} = this.state
      return {timeseriesDomain, timeseriesPool, timeseriesConfig}
    } else {
      const {timeseriesDomain, timeseriesPool, timeseriesConfig} = this.props
      return {timeseriesDomain, timeseriesPool, timeseriesConfig}
    }
  }

  async reloadGraphDataToState (timerangeSec) {
    const utimeSecNow = Math.floor(new Date() / 1000)
    const sinceUtimeSec = utimeSecNow - timerangeSec
    console.log(`Will fetch series data for length of ${(utimeSecNow-sinceUtimeSec) / (3600 * 24)} days`)
    const {baseUrl, network} = this.props
    const {timeseriesDomain, timeseriesPool, timeseriesConfig} = await fetchTimeseriesData(baseUrl, network, sinceUtimeSec, utimeSecNow)
    this.setState({ timeseriesDomain })
    this.setState({ timeseriesPool })
    this.setState({ timeseriesConfig })
  }

  componentWillReceiveProps (nextProps, nextContext) {
    // I suppose not the most beautiful solution but good enough for now.
    // A page might have existing state as user is changing the timerange displayed on graph
    // However, if then user click on different network, that will invoke getInitialProps and componentDidUpdate
    // Now even if I fetch new data in getInitialProps, if the previous state (the graph data) is not modified,
    // the new data will be in props, but the state will stay the old. Because the page gives precedence to display
    // state data instead of props, it will keep displaying old data from previous network, until the user causes
    // state
    this.setState({timeseriesDomain:null})
    this.setState({timeseriesPool:null})
    this.setState({timeseriesConfig:null})
    this.setState({timerangeSec:secsInWeek})
  }


  setGraphTimerange (timerangeSec) {
    this.setState({timerangeSec})
    this.reloadGraphDataToState(timerangeSec)
  }

  render () {
    if (!(this.state) || !(this.state.timerangeSec)) {
      console.log(`Rendering and PROPS timerange is ${this.props.timerangeSec}`)
    } else {
      console.log(`Rendering when timerange STATE value is ${this.state.timerangeSec}`)
    }
    const { network, networkDetails, baseUrl } = this.props
    const {timeseriesDomain, timeseriesPool, timeseriesConfig} = this.getTimeseriesRenderData()
    const timerangeSec = this.getTimerangeSec()
    console.log(JSON.stringify(networkDetails))
    return (
      <Grid>
        <GridRow style={{ backgroundColor: 'white', marginBottom: '-1em' }}>
          <GridColumn width={16}>
            <PageHeader page="stats" network={network} baseUrl={baseUrl}/>
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
          <GridColumn width={16} floated='left'>
            <Grid>
              <GridRow>
                <IntervalDropdown value={timerangeSec}
                                  changeGraphTimerange={this.setGraphTimerange.bind(this)}></IntervalDropdown>
              </GridRow>
              <GridRow>
                <GridColumn>
                  <TxsChart label="Domain tx count" color="darkcyan" type="domain"
                            timeseries={timeseriesDomain}/>
                  <TxsChart label="Pool tx count" color="mediumaquamarine" type="pool"
                            timeseries={timeseriesPool}/>
                  <TxsChart label="Config tx count" color="dodgerblue" type="config"
                            timeseries={timeseriesConfig}/>
                </GridColumn>
              </GridRow>
            </Grid>
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

export default StatsPage
