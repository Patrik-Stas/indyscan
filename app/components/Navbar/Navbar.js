import React, {Component} from "react";
import "./Navbar.scss";
import Link from 'next/link'
import Router from 'next/router'
import MenuLink from "../MenuLink/MenuLink";

class Navbar extends Component {
    constructor(props) {
        super(props);
        this.props = props;
    }

    homePage(network) {
        return () => Router.push(`/home?network=${network}`, `/home/${network}`);
    }

    transactionsPage(network, txType) {
        return () => Router.push(`/txs?network=${network}&txType=${txType}`, `/txs/${network}/${txType}`);
    }

    render() {
        const {network, page} = this.props;
        return (
            <div>
                <MenuLink href={`/home?network=${network}`} as={`/home/${network}`}>Home</MenuLink >
                <MenuLink  href={`/txs?network=${network}&txType=domain`} as={`/txs/${network}/domain`}>Domain</MenuLink >
                <MenuLink  href={`/txs?network=${network}&txType=pool`} as={`/txs/${network}/pool`}>Pool</MenuLink >
                <MenuLink  href={`/txs?network=${network}&txType=config`} as={`/txs/${network}/config`}>Config</MenuLink >
            </div>
        );
    }
}

export default Navbar;


{/*<Menu>*/}
    {/*<Menu.Item onClick={this.homePage(network)} active={page==="home"}>*/}
        {/*Home*/}
    {/*</Menu.Item>*/}
    {/*<Menu.Item onClick={this.transactionsPage(network, 'domain')} active={page==="domain"}>*/}
        {/*Domain*/}
    {/*</Menu.Item>*/}
    {/*<Menu.Item onClick={this.transactionsPage(network, 'pool')} active={page==="pool"}>*/}
        {/*Pool*/}
    {/*</Menu.Item>*/}
    {/*<Menu.Item onClick={this.transactionsPage(network, 'config')} active={page==="config"}>*/}
        {/*Config*/}
    {/*</Menu.Item>*/}
{/*</Menu>*/}