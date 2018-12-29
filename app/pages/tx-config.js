import Head from "next/head";
import "../scss/style.scss";
import Navbar from "../components/Navbar/Navbar";
import fetch from 'isomorphic-unfetch'
import TxListCompact from "../components/TxListCompact/TxListCompact";
import React, {Component} from 'react';

class TxConfig extends Component {

    static getBaseUrl(req) {
        return req ? `${req.protocol}://${req.get('Host')}` : '';
    }

    static async getLastConfigTx(baseUrl) {
        let res = await fetch(`${baseUrl}/api/tx-config`);
        return await res.json();
    }

    static async getInitialProps({req, query}) {
        console.log(`tx-config.js: Get initial props.`);
        const baseUrl = this.getBaseUrl(req);
        const domainTxs = await this.getLastConfigTx(baseUrl);
        return {
            txs: domainTxs.txs,
        }
    }

    render() {
        return (
            <div>
                <TxListCompact txs={this.props.txs}/>
            </div>
        )
    }
}

export default TxConfig;