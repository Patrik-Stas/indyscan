import React, {Component} from 'react';
import "../scss/style.scss";
import TxsChart from "../components/TxChart/TxChart";
import {getTransactions, getTxTimeseries} from "../api-client";
import TxList from "../components/TxList/TxList";
import PageHeader from "../components/PageHeader/PageHeader";

class HomePage extends Component {

    static getBaseUrl(req) {
        return req ? `${req.protocol}://${req.get('Host')}` : '';
    }

    static async getInitialProps({req, query}) {
        const baseUrl = this.getBaseUrl(req);
        const {network} = query;
        const domainTxs = await getTransactions(baseUrl, network, 'domain', 0, 10);
        const timeseriesDomain = await getTxTimeseries(baseUrl, network, 'domain');
        const timeseriesPool = await getTxTimeseries(baseUrl, network, 'pool');
        const timeseriesConfig = await getTxTimeseries(baseUrl, network, 'config');
        // todo: cache the data...
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
            </div>
        )
    }
}

export default HomePage;