import "../scss/style.scss";
import React, {Component} from 'react';
import {getTx} from '../api-client'
import PageHeader from "../components/PageHeader/PageHeader";
import {Grid, Container} from "semantic-ui-react";

const pageSize = 20;

class Tx extends Component {


    static getBaseUrl(req) {
        return req ? `${req.protocol}://${req.get('Host')}` : '';
    }

    static async getInitialProps({req, query}) {
        const {network, txType, seqNo} = query;
        const baseUrl = this.getBaseUrl(req);
        const txDetail = await getTx(baseUrl, network, txType, seqNo);
        return {
            txDetail,
            network,
            txType,
            seqNo,
        }
    }

    render() {
        const {txDetail, network, txType, seqNo} = this.props;
        return (
            <Grid>
                <Grid.Row>
                    <Grid.Column>
                        <PageHeader page={txType || "home"} network={network || "SOVRIN_MAINNET"}/>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column>
                        <Container textAlign='justified'>
                            <code style={{whiteSpace:"pre-wrap"}}>
                                {JSON.stringify(txDetail, null, 2)}
                            </code>
                        </Container>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        )
    }
}

export default Tx;