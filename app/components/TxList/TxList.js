import {Component} from 'react';
import "../scss/style.scss";
import fetch from 'isomorphic-unfetch'
import TxPreview from "../components/TxPreview/TxPreview";
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
        return {
            txs: domainTxs.txs
        }
    }

    render() {
        return (
            <div>
                {this.props.txs.map(txn => <TxPreview tx={txn}/>)}
            </div>
        )
    }
}

export default MainPage;