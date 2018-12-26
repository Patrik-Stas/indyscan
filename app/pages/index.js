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

    static async getTimeseries(baseUrl) {
        let res = await fetch(`${baseUrl}/api/timeseries`);
        return await res.json();
    }

    static async getInitialProps({req, query}) {
        console.log(`getInitialProps`)
        const baseUrl = this.getBaseUrl(req);
        console.log(`Get initial props is running!`);
        const domainTxs = await this.getLastDomainTx(baseUrl);
        const timeSeries = await this.getTimeseries(baseUrl);
        return {txs: domainTxs.txs, timeSeries: timeSeries.histogram}
    }

    onNextTxPage(foo, bar) {

    }


    render() {
        console.log(this.props.timeSeries)
        const zippedTimeseries = _.zip.apply(_, this.props.timeSeries);
        const dates = zippedTimeseries[0].map(t=>format('yyyy.MM.dd', new Date(t)));
        const txCnt = zippedTimeseries[1];
        const data = {
            labels: dates,
                datasets: [{
                data: txCnt,
                label: "Domain",
                borderColor: "#3e95cd",
                fill: false
            }]
        }
        // new charts.Chart(document.getElementById("line-chart"), {
        //     type: 'line',
        //     ,
        //     options: {
        //         title: {
        //             display: true,
        //             text: 'World population per region (in millions)'
        //         }
        //     }
        // });
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