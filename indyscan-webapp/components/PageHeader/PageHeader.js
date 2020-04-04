import React, { Component } from 'react'
import './PageHeader.scss'
import Navbar from '../Navbar/Navbar'
import { Divider, Grid, GridColumn, GridRow } from 'semantic-ui-react'
import MenuLink from '../MenuLink/MenuLink'
import Link from 'next/link'
import { CSSTransition } from 'react-transition-group'
import IndyscanHeader from '../IndyscanHeader/IndyscanHeader'

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
        <Grid id='page-header'>
          <GridRow>
            <h1>
              <Link href={homeLinkHref} as={homeLinkAs}><a className='menulink' style={{ color: 'darkcyan' }}>
                  <IndyscanHeader/>
              </a></Link>
            </h1>
          </GridRow>
          <GridRow style={{ marginTop: '-2em' }}>
            <h5>Hyperledger Indy transaction explorer</h5>
          </GridRow>
        </Grid>
        <Grid  container doubling stackable>
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
