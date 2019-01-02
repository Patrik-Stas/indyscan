import "../scss/style.scss";
import TxListCompact from "../components/TxListCompact/TxListCompact";
import React, {Component} from 'react';
import {getTransactions, getTxCount} from '../api-client'
import PageHeader from "../components/PageHeader/PageHeader";
import {Grid, Pagination} from "semantic-ui-react";
import util from 'util'
import Router from "next/dist/lib/router";

const pageSize = 20;

class Tx extends Component {


    static getBaseUrl(req) {
        return req ? `${req.protocol}://${req.get('Host')}` : '';
    }

    static async getInitialProps({req, query}) {
        const {network, txType, txSeqno} = query;
        const baseUrl = this.getBaseUrl(req);
        const txDetail = {a:"asd"};
        return {
            network,
            txType,
            txSeqno,
            txDetail,
            baseUrl,
        }
    }

    render() {
        const {network, txType, txSeqno} = this.props;
        return (
            <Grid>
                <Grid.Row>
                    <Grid.Column>
                        <PageHeader page={txType || "home"} network={network || "SOVRIN_MAINNET"}/>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column>
                        {JSON.stringify(this.props.txDetail)}
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        )
    }
}

export default Tx;