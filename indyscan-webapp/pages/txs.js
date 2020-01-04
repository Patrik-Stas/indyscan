import '../scss/style.scss'
import TxListCompact from '../components/TxListCompact/TxListCompact'
import React, { Component } from 'react'
import { getTxCount, getTxs } from 'indyscan-api-client'
import PageHeader from '../components/PageHeader/PageHeader'
import { Grid, GridColumn, GridRow, Pagination, Checkbox, Input, Icon } from 'semantic-ui-react'
import Router from 'next/dist/lib/router'
import { getBaseUrl } from '../routing'
import Footer from '../components/Footer/Footer'
import { getConfigTxNames, getDomainsTxNames, getPoolTxNames } from 'indyscan-txtype'
import AwesomeDebouncePromise from 'awesome-debounce-promise'

class Txs extends Component {
  updateUrl (baseUrl, network, ledger, page, pageSize, filterTxNames = '[]', search = null) {
    let routerUrl = `${baseUrl}/txs?network=${network}&ledger=${ledger}&page=${page}&pageSize=${pageSize}&filterTxNames=${filterTxNames}`
    let routerAs = `/txs/${network}/${ledger}?page=${page}&pageSize=${pageSize}&filterTxNames=${filterTxNames}`
    if (search) {
      routerUrl += `&search=${search}`
      routerAs += `&search=${search}`
    }
    Router.push(routerUrl, routerAs)
  }

  handleClick (e, data) {
    const { activePage } = data
    const { baseUrl, network, ledger, pageSize, filterTxNames, search } = this.props
    this.updateUrl(baseUrl, network, ledger, activePage, pageSize, JSON.stringify(filterTxNames), search)
  }

  setParamsFilter (txName, shouldDisplay) {
    const { baseUrl, network, ledger, page, pageSize, filterTxNames, search } = this.props
    let newFilter = []
    if (shouldDisplay) {
      if (!filterTxNames.includes(txName)) {
        filterTxNames.push(txName)
        newFilter = filterTxNames
      }
    } else {
      if (filterTxNames.includes(txName)) {
        newFilter = filterTxNames.filter(item => item !== txName)
      }
    }
    this.updateUrl(baseUrl, network, ledger, page, pageSize, JSON.stringify(newFilter), search)
  }

  asyncFunctionDebounced = AwesomeDebouncePromise(
    this.updateUrl,
    200,
    {},
  );

  async setSearch (newSearch) {
    const { baseUrl, network, ledger, page, pageSize, filterTxNames } = this.props
    await this.asyncFunctionDebounced(baseUrl, network, ledger, page, pageSize, JSON.stringify(filterTxNames), newSearch)

  }

  static async getInitialProps ({ req, query }) {
    const { network, ledger } = query
    const page = (query.page) ? query.page : 1
    const pageSize = (query.pageSize) ? query.pageSize : 50
    const fromRecentTx = (page - 1) * pageSize
    const toRecentTx = page * pageSize
    const baseUrl = getBaseUrl(req)
    const filterTxNames = (query.filterTxNames) ? JSON.parse(query.filterTxNames) : []
    const search = query.search
    const indyscanTxs = await getTxs(baseUrl, network, ledger, fromRecentTx || 0, toRecentTx || pageSize, filterTxNames, 'indyscan', search)
    const txCount = await getTxCount(baseUrl, network, ledger, filterTxNames)
    return {
      indyscanTxs,
      network,
      ledger,
      baseUrl,
      txCount,
      page,
      pageSize,
      filterTxNames,
      search
    }
  }

  renderSelectButtons () {
    let ledgerTxNames
    switch (this.props.ledger) {
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
          <GridColumn key={`filter-checkbox-${txName}`} width={4}>
            <Checkbox style={{ marginTop: '10px' }} label={txName}
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

  handleChange (e) {
    let search = e.target.value
    this.setSearch(search)
  }

  render () {
    const { ledger, network, txCount, page, baseUrl, pageSize, indyscanTxs } = this.props
    const pageCount = Math.ceil(txCount / pageSize)
    return (
      <Grid>
        <GridRow>
          <GridColumn>
            <PageHeader page={ledger || 'home'} network={network} baseUrl={baseUrl} />
          </GridColumn>
        </GridRow>
        <GridRow centered style={{ marginBottom: '2em' }}>
          <Pagination defaultActivePage={page} totalPages={pageCount}
            onPageChange={(e, data) => this.handleClick(e, data)} />
        </GridRow>
        <GridRow>
          {this.renderSelectButtons()}
        </GridRow>
        <GridRow>
          <Input
            onChange={this.handleChange.bind(this)}
            icon={<Icon name='search' inverted circular link />}
            placeholder='Search...'
          />
        </GridRow>
        <GridRow>
          <GridColumn>
            <TxListCompact baseUrl={baseUrl}
              network={network}
              ledger={ledger}
              txs={indyscanTxs} />
          </GridColumn>
        </GridRow>
        <GridRow centered>
          <Pagination defaultActivePage={page} totalPages={pageCount}
            onPageChange={(e, data) => this.handleClick(e, data)} />
        </GridRow>
        <GridRow>
          <GridColumn>
            <Footer />
          </GridColumn>
        </GridRow>
      </Grid>
    )
  }
}

export default Txs
