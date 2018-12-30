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
                <Link href="/">
                    <a title="Our API">Home</a>
                </Link>
                <Link href={`/txs?network=SOVRIN_MAINNET&txType=domain`} as={`/txs/SOVRIN_MAINNET/domain`}>
                    <a title="About Next JS">Domain</a>
                </Link>

                <Link href={`/txs?network=SOVRIN_MAINNET&txType=pool`} as={`/txs/SOVRIN_MAINNET/pool`}>
                    <a title="About Next JS">Pool</a>
                </Link>

                <Link href={`/txs?network=SOVRIN_MAINNET&txType=config`} as={`/txs/SOVRIN_MAINNET/config`}>
                    <a title="About Next JS">Config</a>
                </Link>
            </nav>
        );
    }
}

export default Navbar;