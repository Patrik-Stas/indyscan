import React, { Component } from 'react'
import './Navbar.scss'
import MenuLink from '../MenuLink/MenuLink'

class Navbar extends Component {
  constructor (props) {
    super(props)
    this.props = props
  }

  render () {
    const { network, page } = this.props
    return (
      <div>
        <MenuLink active={page === 'home'} href={`/home?network=${network}`} as={`/home/${network}`}>Home</MenuLink >
        <MenuLink active={page === 'domain'} href={`/txs?network=${network}&ledger=domain`} as={`/txs/${network}/domain`}>Domain</MenuLink >
        <MenuLink active={page === 'pool'} href={`/txs?network=${network}&ledger=pool`} as={`/txs/${network}/pool`}>Pool</MenuLink >
        <MenuLink active={page === 'config'} href={`/txs?network=${network}&ledger=config`} as={`/txs/${network}/config`}>Config</MenuLink >
      </div>
    )
  }
}

export default Navbar
