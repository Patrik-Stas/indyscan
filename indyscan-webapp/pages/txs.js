import '../scss/style.scss'
import TxListCompact from '../components/TxListCompact/TxListCompact'
import React, { Component } from 'react'
import { getTxCount, getTxs } from 'indyscan-api-client'
import PageHeader from '../components/PageHeader/PageHeader'
import { Grid, GridColumn, GridRow, Pagination, Checkbox, Input, Icon, Radio, Label } from 'semantic-ui-react'
import { getBaseUrl } from '../routing'
import Footer from '../components/Footer/Footer'
import { getConfigTxNames, getDomainsTxNames, getPoolTxNames } from 'indyscan-txtype'
import AwesomeDebouncePromise from 'awesome-debounce-promise'
import Router from 'next/router'

class Txs extends Component {
  updateUrl (baseUrl, network, ledger, page, pageSize, filterTxNames = '[]', search = null, sortFromRecent = true) {
    let routerUrl = `/txs?network=${network}&ledger=${ledger}&page=${page}&pageSize=${pageSize}&filterTxNames=${filterTxNames}&sortFromRecent=${sortFromRecent}`
    let routerAs = `/txs/${network}/${ledger}?page=${page}&pageSize=${pageSize}&filterTxNames=${filterTxNames}&sortFromRecent=${sortFromRecent}`
    if (search) {
      routerUrl += `&search=${search}`
      routerAs += `&search=${search}`
    }
    Router.push(routerUrl, routerAs)
  }

  handleClick (e, data) {
    const { activePage } = data
    const { baseUrl, network, ledger, pageSize, filterTxNames, search, sortFromRecent } = this.props
    this.updateUrl(baseUrl, network, ledger, activePage, pageSize, JSON.stringify(filterTxNames), search, sortFromRecent)
  }

  setParamsFilter (txName, shouldDisplay) {
    const { baseUrl, network, ledger, page, pageSize, filterTxNames, search, sortFromRecent } = this.props
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
    this.updateUrl(baseUrl, network, ledger, page, pageSize, JSON.stringify(newFilter), search, sortFromRecent)
  }

  flipSortFromRecent () {
    const { baseUrl, network, ledger, page, pageSize, filterTxNames, search, sortFromRecent } = this.props
    const sortFromRecentNew = sortFromRecent === 'true' ? 'false' : 'true'
    this.updateUrl(baseUrl, network, ledger, page, pageSize, JSON.stringify(filterTxNames), search, sortFromRecentNew)
  }

  asyncFunctionDebounced = AwesomeDebouncePromise(
    this.updateUrl,
    200,
    {}
  );

  async setSearch (newSearch) {
    let { baseUrl, network, ledger, pageSize, filterTxNames, sortFromRecent } = this.props
    const FIRST_PAGE = 1
    await this.asyncFunctionDebounced(baseUrl, network, ledger, FIRST_PAGE, pageSize, JSON.stringify(filterTxNames), newSearch, sortFromRecent)
  }

  static async getInitialProps ({ req, query }) {
    const { network, ledger } = query
    const page = (query.page) ? query.page : 1
    const pageSize = (query.pageSize) ? query.pageSize : 50
    const skip = pageSize * (page - 1)
    const baseUrl = getBaseUrl(req)
    const filterTxNames = (query.filterTxNames) ? JSON.parse(query.filterTxNames) : []
    const search = query.search
    const sortFromRecent = (query.sortFromRecent) ? query.sortFromRecent : 'true'
    const indyscanTxs = await getTxs(baseUrl, network, ledger, skip, pageSize, filterTxNames, 'indyscan', search, sortFromRecent)
    const txCount = await getTxCount(baseUrl, network, ledger, filterTxNames, search)
    return {
      indyscanTxs,
      network,
      ledger,
      baseUrl,
      txCount,
      page,
      pageSize,
      filterTxNames,
      search,
      sortFromRecent
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
            <Checkbox style={{ marginTop: '10px' }}
              onChange={(event, data) => { this.setParamsFilter(txName, data.checked) }}
              checked={this.props.filterTxNames.includes(txName)}
            />
            <Label style={{ marginLeft: 10 }}>{txName}</Label>
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
    const { ledger, network, txCount, page, baseUrl, pageSize, indyscanTxs, sortFromRecent } = this.props
    const pageCount = Math.min(Math.ceil(txCount / pageSize), 200)
    return (
      <Grid>
        <GridRow>
          <GridColumn>
            <PageHeader page={ledger || 'home'} network={network} baseUrl={baseUrl} />
          </GridColumn>
        </GridRow>
        <GridRow centered style={{ marginBottom: '2em' }}>
          <Pagination activePage={page} totalPages={pageCount}
            onPageChange={(e, data) => this.handleClick(e, data)} />
        </GridRow>
        <GridRow>
          {this.renderSelectButtons()}
        </GridRow>
        <GridRow style={{ margin: '1em' }}>
          <GridColumn width={5}>
            <Input
              onChange={this.handleChange.bind(this)}
              style={{ width: '100%' }}
              icon={<Icon name='search' inverted circular link />}
              placeholder='Search...'
            />
          </GridColumn>
          <GridColumn width={1} />
          <GridColumn width={5}>
            <span style={{ marginRight: 15 }}>From the oldest</span>
            <Radio slider checked={sortFromRecent === 'true'} onChange={() => { this.flipSortFromRecent() }} />
            <span style={{ marginLeft: 15 }}>From the most recent</span>
          </GridColumn>
          <GridColumn floated='right' width={2}>
            <span style={{ fontSize: '2em', marginRight: '0.2em' }}>{txCount}</span>
            <span style={{ fontSize: '1.2em' }}> txs</span></GridColumn>
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
          <Pagination activePage={page} totalPages={pageCount}
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
