import '../scss/style.scss'
import TxListCompact from '../components/TxListCompact/TxListCompact'
import React, { Component } from 'react'
import { getNetwork, getTransactions, getTxCount } from 'indyscan-api-client'
import PageHeader from '../components/PageHeader/PageHeader'
import { Grid, GridColumn, GridRow, Pagination, Checkbox, TableCell } from 'semantic-ui-react'
import Router from 'next/dist/lib/router'
import { getBaseUrl } from '../routing'
import Footer from '../components/Footer/Footer'
import { getConfigTxNames, getDomainsTxNames, getPoolTxNames } from 'indyscan-txtype'
import Link from 'next/link'
import fetch from 'isomorphic-fetch'

class Txs extends Component {
  static async getInitialProps ({req, query}) {
    const baseUrl = getBaseUrl(req)
    return {
      baseUrl
    }
  }

  render () {
    const {baseUrl} = this.props
    return (
      <Grid>
        <GridRow style={{marginTop: '0.1em'}}>
          <span>Something went wrong. <a href='/'>Try again?</a>
            <Link href={baseUrl} as='/'><a className='menulink'>Agaoin</a></Link>
          </span>
        </GridRow>
      </Grid>
    )
  }
}

export default Txs
