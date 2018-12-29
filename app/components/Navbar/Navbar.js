import React, {Component} from "react";
import "./Navbar.scss";
import {Input, Menu, Segment} from 'semantic-ui-react'
import Router from 'next/router'


class Navbar extends Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.state = {activePage:''}
    }

    async componentDidMount() {
        console.log(`Navbar mounted`);
        console.log(Router.pathname);
        console.log(Router.route);
    }
    //
    // static async getInitialProps({req, query}) {
    //     // const baseUrl = this.getBaseUrl(req);
    //     console.log('navbar initial props')
    //     console.log(JSON.stringify(req))
    //     // const domainTxs = await this.getLastDomainTx(baseUrl);
    // }

    render() {
        return (
            <nav>
                <Menu pointing>
                    <Menu.Item as="a" href="/" name='home' />
                    <Menu.Item as="a" href="/tx-domain" name='domain' />
                    <Menu.Item as="a" href="/tx-pool" name='pool'/>
                    <Menu.Item as="a" href="/tx-config" name='config'/>
                </Menu>
            </nav>
        );
    }
}

export default Navbar;