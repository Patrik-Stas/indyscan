import React, {Component} from 'react';
import "../scss/style.scss";
import TxsChart from "../components/TxChart/TxChart";
import {getTransactions, getTxTimeseries} from "../api-client";
import {Divider, Grid} from 'semantic-ui-react';
import PageHeader from "../components/PageHeader/PageHeader";
import TxPreviewList from "../components/TxPreviewList/TxPreviewList";

class HomePage extends Component {

    static getBaseUrl(req) {
        return req ? `${req.protocol}://${req.get('Host')}` : '';
    }

    static async getInitialProps({req, query}) {
        const baseUrl = this.getBaseUrl(req);
        const {network, txType} = query;
        const domainTxs = await getTransactions(baseUrl, network, 'domain', 0, 13);
        const timeseriesDomain = await getTxTimeseries(baseUrl, network, 'domain');
        const timeseriesPool = await getTxTimeseries(baseUrl, network, 'pool');
        const timeseriesConfig = await getTxTimeseries(baseUrl, network, 'config');
        // todo: cache the data...
        return {
            network, txType,
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
                <Grid.Row style={{backgroundColor: "white", marginBottom:"-1em"}}>
                    <Grid.Column width={16}>
                        <PageHeader page="home" network={network}/>
                    </Grid.Column>
                </Grid.Row>
                {/*<Divider style={{paddingTop:"-2em"}}/>*/}
                <Grid.Row>
                    <Grid.Column width={10} floated='left'>
                        <Grid>
                            <Grid.Row>
                                <Grid.Column>
                                    <TxsChart timeseriesDomain={this.props.timeseriesDomain}
                                              timeseriesPool={this.props.timeseriesPool}
                                              timeseriesConfig={this.props.timeseriesConfig}/>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Grid.Column>
                    <Grid.Column width={6} floated='right' verticalAlign='left' style={{paddingLeft:"7em"}}>
                        <Grid.Row centered verticalAlign='right'>
                            <h2>Last domain transactions</h2>
                        </Grid.Row>
                        <Grid.Row centered style={{marginTop:"2em"}}>
                            <Grid.Column verticalAlign='right'>
                                <TxPreviewList txs={this.props.txs}/>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid.Column>

                </Grid.Row>
            </Grid>
        )
    }
}

export default HomePage;