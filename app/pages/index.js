import Head from "next/head";
import {Component} from 'react';
import "../scss/style.scss";
import Navbar from "../components/Navbar/Navbar";
import fetch from 'isomorphic-unfetch'
import TxPreview from "../components/TxPreview/TxPreview";
import Pagination from 'rc-pagination';
import {Container} from 'semantic-ui-react';
import TxsChart from "../components/TxChart/TxChart";
import {getTimeseriesConfig, getTimeseriesDomain, getTimeseriesPool} from "../api-client";

class MainPage extends Component {

    static getBaseUrl(req) {
        return req ? `${req.protocol}://${req.get('Host')}` : '';
    }

    static async getLastDomainTx(baseUrl) {
        let res = await fetch(`${baseUrl}/api/tx-domain`);
        return await res.json();
    }


    static async getInitialProps({req, query}) {
        const baseUrl = this.getBaseUrl(req);
        const domainTxs = await this.getLastDomainTx(baseUrl);
        const timeseriesDomain = await getTimeseriesDomain(baseUrl);
        const timeseriesPool = await getTimeseriesPool(baseUrl);
        const timeseriesConfig = await getTimeseriesConfig(baseUrl);
        return {
            timeseriesDomain: timeseriesDomain.histogram,
            timeseriesPool: timeseriesPool.histogram,
            timeseriesConfig: timeseriesConfig.histogram,
            txs: domainTxs.txs
        }
    }

    render() {
        return (
            <Container>
                <Head/>
                <h1>Hyperldeger Indy Scan</h1>
                <TxsChart timeseriesDomain={this.props.timeseriesDomain}
                          timeseriesPool={this.props.timeseriesPool}
                          timeseriesConfig={this.props.timeseriesConfig}/>
                <Navbar/>
                <div>
                    {this.props.txs.map(txn => <TxPreview tx={txn}/>)}
                </div>

                {/*<Pagination current={2} total={50} onChange={this.onNextTxPage}/>*/}
            </Container>
        )
    }
}

export default MainPage;