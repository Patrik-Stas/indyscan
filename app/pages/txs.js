import "../scss/style.scss";
import TxListCompact from "../components/TxListCompact/TxListCompact";
import React, {Component} from 'react';
import {getTransactions, getTxCount} from '../api-client'
import PageHeader from "../components/PageHeader/PageHeader";
import {Grid, Pagination} from "semantic-ui-react";
import util from 'util'
import Router from "next/dist/lib/router";

const pageSize = 20;

class Txs extends Component {


    static getBaseUrl(req) {
        return req ? `${req.protocol}://${req.get('Host')}` : '';
    }

    handleClick(e, data) {
        const {activePage} = data;
        const {baseUrl, network, txType} = this.props;
        Router.push(`${baseUrl}/txs?network=${network}&txType=${txType}&fromRecentTx=${(activePage-1)*pageSize}&toRecentTx=${activePage*pageSize}`, `/txs/${network}/${txType}`);
    }

    static async getInitialProps({req, query}) {
        const {network, txType, fromRecentTx, toRecentTx} = query;
        const baseUrl = this.getBaseUrl(req);
        const domainTxs = await getTransactions(baseUrl, network, txType, fromRecentTx || 0, toRecentTx || pageSize);
        const txCount = await getTxCount(baseUrl, network, txType);
        return {
            txs: domainTxs.txs,
            network,
            txType,
            baseUrl,
            txCount
        }
    }

    render() {
        const {currentPath, txType, network, txCount} = this.props;
        const pageCount = Math.ceil(txCount / pageSize);
        return (
            <Grid>
                <Grid.Row>
                    <Grid.Column>
                        <PageHeader currentPath={currentPath} page={txType || "home"}
                                    network={network || "SOVRIN_MAINNET"}/>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column>
                        <TxListCompact txs={this.props.txs}/>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row centered>
                    <Pagination defaultActivePage={1} totalPages={pageCount} onPageChange={(e, data) => this.handleClick(e, data)}/>
                </Grid.Row>
            </Grid>
        )
    }
}

export default Txs;