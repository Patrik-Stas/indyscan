import React, {Component} from 'react';
import "../scss/style.scss";
import fetch from 'isomorphic-unfetch'
import TxsChart from "../components/TxChart/TxChart";
import {getTimeseriesConfig, getTxTimeseries, getTimeseriesPool} from "../api-client";
import TxPreviewList from "../components/TxPreviewList/TxPreviewList";
import {getTransactions} from '../api-client'

class IndexPage extends Component {

    render() {
        return (
            <div>
                Homepage
            </div>
        )
    }
}

export default IndexPage;