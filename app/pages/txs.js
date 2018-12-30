import "../scss/style.scss";
import fetch from 'isomorphic-unfetch'
import TxListCompact from "../components/TxListCompact/TxListCompact";
import React, {Component} from 'react';
import queryString from 'query-string';
import {getTransactions} from '../api-client'

class Txs extends Component {

    static getBaseUrl(req) {
        return req ? `${req.protocol}://${req.get('Host')}` : '';
    }


    static async getInitialProps({req, query}) {
        console.log(`tx-config.js: Get initial props. query= ${JSON.stringify(query)}`);
        const {network, txType} = query;
        const baseUrl = this.getBaseUrl(req);
        const domainTxs = await getTransactions(baseUrl, network, txType, 0, 20);
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

export default Txs;