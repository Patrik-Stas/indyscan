import React, {Component} from "react";
import "./Navbar.scss";
import {Input, Menu, Segment} from 'semantic-ui-react'
import Router from 'next/router'
import Link from "next/link";


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
                {/*<Menu pointing>*/}
                    {/*<Menu.Item as="a" href="/" name='home' />*/}
                    {/*<Menu.Item as="a" href="/tx-domain" name='domain' />*/}
                    {/*<Menu.Item as="a" href="/tx-pool" name='pool'/>*/}
                    {/*<Menu.Item as="a" href="/tx-config" name='config'/>*/}
                {/*</Menu>*/}

                <Link href="/">
                    <a title="Our API">Home</a>
                </Link>
                <Link href="/tx-domain">
                    <a title="About Next JS">Domain</a>
                </Link>

                <Link href="/tx-pool">
                    <a title="About Next JS">Pool</a>
                </Link>

                <Link href="/tx-config">
                    <a title="About Next JS">Config</a>
                </Link>

            </nav>
        );
    }
}

export default Navbar;