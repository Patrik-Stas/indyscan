import React, {Component} from 'react';
import "../scss/style.scss";
import fetch from 'isomorphic-unfetch'
import TxsChart from "../components/TxChart/TxChart";
import {getTxTimeseries} from "../api-client";
import TxList from "../components/TxList/TxList";
import {getTransactions} from '../api-client'
import PageHeader from "../components/PageHeader/PageHeader";
import {Container as SemanticContainer} from "semantic-ui-react";

class HomePage extends Component {

    static getBaseUrl(req) {
        return req ? `${req.protocol}://${req.get('Host')}` : '';
    }

    static async getInitialProps({req, query}) {
        console.log(`[index.js] beginning of getInitialProps()`);
        const baseUrl = this.getBaseUrl(req);
        const {network} = query;
        const domainTxs = await getTransactions(baseUrl, network, 'domain', 0, 10);
        const timeseriesDomain = await getTxTimeseries(baseUrl, network, 'domain');
        const timeseriesPool = await getTxTimeseries(baseUrl, network, 'pool');
        const timeseriesConfig = await getTxTimeseries(baseUrl, network, 'config');
        // todo: cache the data...
        console.log(`[index.js] end of getInitialProps()`);
        return {
            network,
            txs: domainTxs.txs,
            timeseriesDomain: timeseriesDomain.histogram,
            timeseriesPool: timeseriesPool.histogram,
            timeseriesConfig: timeseriesConfig.histogram,
        }
    }

    render() {
        const {network} = this.props;
        return (
            <div>
                <PageHeader currentPath={this.props.currentPath} page="home" network={network || "SOVRIN_MAINNET"}/>
                <TxsChart timeseriesDomain={this.props.timeseriesDomain}
                          timeseriesPool={this.props.timeseriesPool}
                          timeseriesConfig={this.props.timeseriesConfig}/>
                <TxList txs={this.props.txs}/>

                {/*<Pagination current={2} total={50} onChange={this.onNextTxPage}/>*/}
            </div>
        )
    }
}

export default HomePage;