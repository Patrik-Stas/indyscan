import Head from "next/head";
import {Component} from 'react';
import "../scss/style.scss";
import Navbar from "../components/Navbar";
import fetch from 'isomorphic-unfetch'
import TxPreview from "../components/TxPreview";
import Pagination from 'rc-pagination';
import {Container} from 'semantic-ui-react';
// const charts = require('chart.js');
import {Line} from 'react-chartjs-2';
import _ from 'lodash'
import format from 'date-format';

class MainPage extends Component {

    static getBaseUrl(req) {
        return req ? `${req.protocol}://${req.get('Host')}` : '';
    }

    static async getLastDomainTx(baseUrl) {
        let res = await fetch(`${baseUrl}/api/tx-domain`);
        return await res.json();
    }

    static async getTimeseriesDomain(baseUrl) {
        let res = await fetch(`${baseUrl}/api/tx-domain/timeseries`);
        return await res.json();
    }

    static async getTimeseriesPool(baseUrl) {
        let res = await fetch(`${baseUrl}/api/tx-pool/timeseries`);
        return await res.json();
    }

    static async getTimeseriesConfig(baseUrl) {
        let res = await fetch(`${baseUrl}/api/tx-config/timeseries`);
        return await res.json();
    }

    static async getInitialProps({req, query}) {
        console.log(`getInitialProps`)
        const baseUrl = this.getBaseUrl(req);
        console.log(`Get initial props is running!`);
        const domainTxs = await this.getLastDomainTx(baseUrl);
        const timeseriesDomain = await this.getTimeseriesDomain(baseUrl);
        const timeseriesPool = await this.getTimeseriesPool(baseUrl);
        const timeseriesConfig = await this.getTimeseriesConfig(baseUrl);
        return {
            txs: domainTxs.txs,
            timeseriesDomain: timeseriesDomain.histogram,
            timeseriesPool : timeseriesPool.histogram,
            timeseriesConfig : timeseriesConfig .histogram
        }
    }

    static createChartsDataset(timeSeries, label, borderColor) {
        const zippedTimeseries = _.zip.apply(_, timeSeries);
        const dates = zippedTimeseries[0].map(t=>format('yyyy.MM.dd', new Date(t)));
        const txCnt = zippedTimeseries[1];
        return {
            labels: dates,
            dataset: {
                data: txCnt,
                label,
                borderColor,
                fill: false
            }
        }
    }

    render() {
        const domain = MainPage.createChartsDataset(this.props.timeseriesDomain, "Domain tx count", "#3e95cd");
        const pool = MainPage.createChartsDataset(this.props.timeseriesPool, "Pool tx count", "#cd4639");
        const config = MainPage.createChartsDataset(this.props.timeseriesConfig, "Config tx count", "#3dcd34");
        const data = {
            labels: domain.labels,
            datasets: [
                domain.dataset,
                pool.dataset,
                config.dataset,
            ]
        };
        return (
            <Container>
                <Head/>
                <h1>Hyperldeger Indy Scan</h1>
                <Navbar/>
                <Line data={data}/>
                <div>
                    {this.props.txs.map(txn => <TxPreview tx={txn}/>)}
                </div>

                {/*<Pagination current={2} total={50} onChange={this.onNextTxPage}/>*/}
            </Container>
        )
    }
}

export default MainPage;