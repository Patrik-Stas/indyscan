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
import TxList from "../components/TxList/TxList";
import PageHeader from "../components/PageHeader/PageHeader";
import Router from "next/dist/lib/router";

class MainPage extends Component {

    static getBaseUrl(req) {
        return req ? `${req.protocol}://${req.get('Host')}` : '';
    }

    static async getLastDomainTx(baseUrl) {
        let res = await fetch(`${baseUrl}/api/tx-domain`);
        return await res.json();
    }

    async componentDidMount() {
        console.log(`index page mounted`);
        console.log(Router.pathname);
        console.log(Router.route);
    }
    //
    static async getInitialProps({req, query}) {
        const baseUrl = this.getBaseUrl(req);
        const domainTxs = await this.getLastDomainTx(baseUrl);
        const timeseriesDomain = await getTimeseriesDomain(baseUrl);
        const timeseriesPool = await getTimeseriesPool(baseUrl);
        const timeseriesConfig = await getTimeseriesConfig(baseUrl);
        return {
            txs: domainTxs.txs,
            timeseriesDomain: timeseriesDomain.histogram,
            timeseriesPool: timeseriesPool.histogram,
            timeseriesConfig: timeseriesConfig.histogram,
        }
    }

    render() {
        return (
            <div>
                <TxsChart timeseriesDomain={this.props.timeseriesDomain}
                          timeseriesPool={this.props.timeseriesPool}
                          timeseriesConfig={this.props.timeseriesConfig}/>
                <TxList txs={this.props.txs}/>

                {/*<Pagination current={2} total={50} onChange={this.onNextTxPage}/>*/}
            </div>
        )
    }
}

export default MainPage;