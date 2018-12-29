import "../scss/style.scss";
import fetch from 'isomorphic-unfetch'
import TxListCompact from "../components/TxListCompact/TxListCompact";
import React, {Component} from 'react';
import queryString from 'query-string';

class TxConfig extends Component {

    static getBaseUrl(req) {
        return req ? `${req.protocol}://${req.get('Host')}` : '';
    }

    static async getLastConfigTx(baseUrl, fromRecentTx, toRecentTx) {
        const query = queryString.stringify({fromRecentTx, toRecentTx});
        console.log(`Fetching config txs from ${fromRecentTx} to ${toRecentTx}`)
        let res = await fetch(`${baseUrl}/api/tx-config?${query}`);
        return await res.json();
    }

    static async getInitialProps({req, query}) {
        console.log(`tx-config.js: Get initial props.`);
        const baseUrl = this.getBaseUrl(req);
        const domainTxs = await this.getLastConfigTx(baseUrl, 0, 20);
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