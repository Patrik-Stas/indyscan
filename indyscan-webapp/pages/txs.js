import '../scss/style.scss'
import TxListCompact from '../components/TxListCompact/TxListCompact'
import React, { Component } from 'react'
import { getTransactions, getTxCount } from 'indyscan-api'
import PageHeader from '../components/PageHeader/PageHeader'
import { Grid, GridColumn, GridRow, Pagination } from 'semantic-ui-react'
import Router from 'next/dist/lib/router'
import { getBaseUrl } from '../routing'
import Footer from '../components/Footer/Footer'
import { Checkbox, Divider } from 'semantic-ui-react'
import { getConfigTxTypes, getDomainTxTypes, getPoolTxTypes, txNameToTxCode } from '../data/tx-types'

class Txs extends Component {

  handleClick (e, data) {
    const {activePage} = data
    const {baseUrl, network, txType, pageSize} = this.props
    Router.push(
      `${baseUrl}/txs?network=${network}&txType=${txType}&page=${activePage}&pageSize=${pageSize}`,
      `/txs/${network}/${txType}?page=${activePage}&pageSize=${pageSize}`
    )
  }

  static async getInitialProps ({req, query}) {
    const {network, txType} = query
    const page = (!!query.page) ? query.page : 1
    const pageSize = (!!query.pageSize) ? query.pageSize : 50
    const fromRecentTx = (page - 1) * pageSize
    const toRecentTx = page * pageSize
    const baseUrl = getBaseUrl(req)
    const filter = query.filter || {} //|| {'txn.type': {'$in': ['102', '101']} }
    const domainTxs = await getTransactions(baseUrl, network, txType, fromRecentTx || 0, toRecentTx || pageSize, filter)
    const txCount = await getTxCount(baseUrl, network, txType)
    console.log(`Txs page loaded baseurl = ${baseUrl}`)
    return {
      txs: domainTxs.txs,
      network,
      txType,
      baseUrl,
      txCount,
      page,
      pageSize
    }
  }

  renderSelectButtons () {
    let txTypesForLedger
    switch (this.props.txType) {
      case 'domain':
        txTypesForLedger = getDomainTxTypes()
        break
      case 'pool':
        txTypesForLedger = getPoolTxTypes()
        break
      case 'config':
        txTypesForLedger = getConfigTxTypes()
        break
      default:
        txTypesForLedger = []
    }
    let checkButtons = []
    for (const txType of txTypesForLedger) {
      const txTypeCode = txNameToTxCode(txType)
      const box = (
        <GridColumn width={2}>
          <Checkbox label={txType}/>
        </GridColumn>)
      checkButtons.push(box)
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
        <GridRow centered>
          <Pagination defaultActivePage={page} totalPages={pageCount}
                      onPageChange={(e, data) => this.handleClick(e, data)}/>
        </GridRow>
        <GridRow>
          {this.renderSelectButtons()}
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