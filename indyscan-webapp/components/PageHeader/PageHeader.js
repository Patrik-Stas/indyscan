import React, { Component } from 'react'
import './PageHeader.scss'
import Navbar from '../Navbar/Navbar'
import { Divider, Grid, GridColumn, GridRow } from 'semantic-ui-react'
import MenuLink from '../MenuLink/MenuLink'
import Link from 'next/link'

const { getNetworks } = require('indyscan-api-client')

class PageHeader extends Component {
  constructor (props) {
    super()
    this.state = {
      networks: null
    }
  }

  buildNextLinkHome (networkId) {
    return {
      'href': `/home?network=${networkId}`,
      'as': `/home/${networkId}`
    }
  }

  buildNextLink (page, network) {
    if (page === 'home') {
      return {
        'href': `/home?network=${network.id}`,
        'as': `/home/${network.id}`
      }
    } else {
      return {
        'href': `/txs?network=${network.id}&ledger=${page}`,
        'as': `/txs/${network.id}/${page}`
      }
    }
  }

  renderNetworks (networks, activeNetwork) {
    let networkMenuLinks = []
    for (let i = 0; i < networks.length; i++) {
      const network = networks[i]
      const { href, as } = this.buildNextLink(this.props.page, network)
      networkMenuLinks.push(
        <MenuLink
          key={`netlink-${network.id}`}
          active={network.id === activeNetwork}
          href={href}
          as={as}>
          {network.ui.display}
        </MenuLink>
      )
    }
    return networkMenuLinks
  }

  async componentDidMount () {
    const networks = await getNetworks(this.props.baseUrl)
    this.setState({ networks })
  }

  render () {
    const { network } = this.props
    const { href: homeLinkHref, as: homeLinkAs } = this.buildNextLinkHome(network)
    return (
      <div>
        <div id='page-header'>
          <div id='indyscanlogo'>
            <img style={{ height: '7em' }} src="/static/radar.png" alt="Indyscan logo"/>
          </div>
          <div id='indyscan-caption'>
            <Link href={homeLinkHref} as={homeLinkAs}><a className='menulink' style={{ color: 'darkcyan' }}>
              <h1>Indyscan</h1>
            </a></Link>
            <div >
              <h2>Hyperledger Indy transaction explorer</h2>
            </div>
          </div>
        </div>
        <Grid container doubling stackable>
          {
            this.state.networks &&
            <GridRow>
              <GridColumn width={11}>
                {this.renderNetworks(this.state.networks || [network], network)}
              </GridColumn>
              <GridColumn align='right' width={5}>
                <Navbar page={this.props.page} network={this.props.network}/>
              </GridColumn>
            </GridRow>
          }

        </Grid>
        <Divider/>
      </div>
    )
  }
}

export default PageHeader
