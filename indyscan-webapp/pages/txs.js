import '../scss/style.scss'
import TxListCompact from '../components/TxListCompact/TxListCompact'
import React, { Component } from 'react'
import { getTransactions, getTxCount } from 'indyscan-api'
import PageHeader from '../components/PageHeader/PageHeader'
import { Divider, Grid, GridColumn, GridRow, Pagination } from 'semantic-ui-react'
import Router from 'next/dist/lib/router'
import { getBaseUrl } from '../routing'
import Footer from '../components/Footer/Footer'
import { Checkbox } from 'semantic-ui-react'
import { getConfigTxNames, getDomainsTxNames, getPoolTxNames } from 'indyscan-txtype'

class Txs extends Component {

  updateUrl(baseUrl, network, txType, page, pageSize, filterTxNames='[]') {
    Router.push(
      `${baseUrl}/txs?network=${network}&txType=${txType}&page=${page}&pageSize=${pageSize}&filterTxNames=${filterTxNames}`,
      `/txs/${network}/${txType}?page=${page}&pageSize=${pageSize}&filterTxNames=${filterTxNames}`
    )
  }

  handleClick (e, data) {
    const {activePage} = data
    const {baseUrl, network, txType, pageSize, filterTxNames} = this.props
    this.updateUrl(baseUrl, network, txType, activePage, pageSize, JSON.stringify(filterTxNames))
  }

  setParamsFilter (txName, shouldDisplay) {
    console.log(`Set filter parameters. Change: ${txName} to shouldDisplay = ${shouldDisplay}`)
    const {baseUrl, network, txType, page, pageSize, filterTxNames} = this.props
    let newFilter = []
    if (shouldDisplay) {
      if (!filterTxNames.includes(txName)) {
        filterTxNames.push(txName)
        newFilter= filterTxNames
      }
    } else {
      if (filterTxNames.includes(txName)) {
        newFilter = filterTxNames.filter(item => item !== txName)
      }
    }
    console.log(JSON.stringify(newFilter))
    this.updateUrl(baseUrl, network, txType, page, pageSize, JSON.stringify(newFilter))
  }

  static async getInitialProps ({req, query}) {
    console.log(`TXS PAGE :: getInitialProps >>> ${JSON.stringify(query)} `)
    const {network, txType} = query
    const page = (!!query.page) ? query.page : 1
    const pageSize = (!!query.pageSize) ? query.pageSize : 50
    const fromRecentTx = (page - 1) * pageSize
    const toRecentTx = page * pageSize
    const baseUrl = getBaseUrl(req)
    const filterTxNames = (query.filterTxNames) ? JSON.parse(query.filterTxNames) : []
    const domainTxs = await getTransactions(baseUrl, network, txType, fromRecentTx || 0, toRecentTx || pageSize, filterTxNames)
    const txCount = await getTxCount(baseUrl, network, txType, filterTxNames)
    return {
      txs: domainTxs.txs,
      network,
      txType,
      baseUrl,
      txCount,
      page,
      pageSize,
      filterTxNames
    }
  }

  renderSelectButtons () {
    let ledgerTxNames
    switch (this.props.txType) {
      case 'domain':
        ledgerTxNames = getDomainsTxNames()
        break
      case 'pool':
        ledgerTxNames = getPoolTxNames()
        break
      case 'config':
        ledgerTxNames = getConfigTxNames()
        break
      default:
        ledgerTxNames = []
    }
    let checkButtons = []
    if (ledgerTxNames.length > 1) {
      for (const txName of ledgerTxNames) {
        const box = (
          <GridColumn width={2}>
            <Checkbox label={txName}
                      onChange={(event, data) => { this.setParamsFilter(txName, data.checked) }}
                      checked={this.props.filterTxNames.includes(txName)}
            />
          </GridColumn>)
        checkButtons.push(box)
      }
    }
    return (
      checkButtons
    )
  }

  render () {

    const {txType, network, txCount, page, baseUrl, pageSize} = this.props
    const pageCount = Math.ceil(txCount / pageSize)
    return (
      <Grid>
        <GridRow>
          <GridColumn>
            <PageHeader page={txType || 'home'} network={network} baseUrl={baseUrl}/>
          </GridColumn>
        </GridRow>
        <GridRow centered style={{marginBottom:'2em'}}>
          <Pagination defaultActivePage={page} totalPages={pageCount}
                      onPageChange={(e, data) => this.handleClick(e, data)}/>
        </GridRow>
        <GridRow>
              {this.renderSelectButtons()}
          <GridColumn floated='right' width={2}><span style={{fontSize:'2em', marginRight:'0.2em'}}>{txCount}</span><span style={{fontSize:'1.2em'}}> txs</span></GridColumn>
        </GridRow>
        <GridRow>
          <GridColumn>
            <TxListCompact baseUrl={this.props.baseUrl} network={this.props.network} txType={this.props.txType}
                           txs={this.props.txs}/>
          </GridColumn>
        </GridRow>
        <GridRow centered>
          <Pagination defaultActivePage={page} totalPages={pageCount}
                      onPageChange={(e, data) => this.handleClick(e, data)}/>
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

export default Txs