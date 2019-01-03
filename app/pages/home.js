import React, {Component} from 'react';
import "../scss/style.scss";
import TxsChart from "../components/TxChart/TxChart";
import {getTransactions, getTxTimeseries} from "../api-client";
import {Grid} from 'semantic-ui-react';
import PageHeader from "../components/PageHeader/PageHeader";
import TxList from "../components/TxList/TxList";

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
            <Grid>
                <Grid.Row style={{backgroundColor: "white"}}>
                    <Grid.Column width={16}>
                        <PageHeader page="home" network={network || "SOVRIN_MAINNET"}/>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={10}>
                        <Grid>
                            <Grid.Row>
                                <h2>Transaction trends</h2>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column>
                                    <TxsChart timeseriesDomain={this.props.timeseriesDomain}
                                              timeseriesPool={this.props.timeseriesPool}
                                              timeseriesConfig={this.props.timeseriesConfig}/>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Grid.Column>
                    <Grid.Column width={6}>
                        <Grid.Row>
                            <h2>Last domain transactions</h2>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column>
                                <TxList txs={this.props.txs}/>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid.Column>

                </Grid.Row>
            </Grid>
        )
    }
}

export default HomePage;