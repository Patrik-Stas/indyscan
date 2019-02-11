import "../scss/style.scss";
import React, {Component} from 'react';
import {getTx} from '../api-client'
import PageHeader from "../components/PageHeader/PageHeader";
import {Grid, Container} from "semantic-ui-react";
import JSONPretty from 'react-json-pretty';
import top100 from "../components/palettes";
import Link from "next/link";
import {getTxLinkData} from "../routing";
import Router from "next/dist/lib/router";
const pageSize = 20;
const networks = require('../server/networks');

class Tx extends Component {


    static getBaseUrl(req) {
        return req ? `${req.protocol}://${req.get('Host')}` : '';
    }

    static async getInitialProps({req, query}) {
        const {network, txType, seqNo} = query;
        const baseUrl = this.getBaseUrl(req);
        const txDetail = await getTx(baseUrl, network, txType, seqNo);
        return {
            baseUrl,
            txDetail,
            network,
            txType,
            seqNo,
        }
    }

    handleArrowKeys(event){
        const {baseUrl, network, txType, seqNo} = this.props;
        switch (event.key) {
            case "ArrowLeft": {
                const {href, as} = getTxLinkData(baseUrl, network, txType, parseInt(seqNo) - 1);
                Router.push(href, as);
                break;
            }
            case "ArrowRight": {
                const {href, as} = getTxLinkData(baseUrl, network, txType, parseInt(seqNo) + 1);
                Router.push(href, as);
                break;
            }
        }
    }

    componentDidMount(){
        document.addEventListener("keydown", this.handleArrowKeys.bind(this), false);
    }
    componentWillUnmount(){
        document.removeEventListener("keydown", this.handleArrowKeys.bind(this), false);
    }

    render() {
        const palette = top100()[7];
        const mytheme = {
            main: `line-height:1.3;color:${palette[0]};background:white;overflow:auto;border-style:solid;border-color:${palette[1]};border-width:1px;padding:4em`,
            key: `color:${palette[1]};`,
            string: `color:${palette[2]};`,
            value: `color:${palette[3]};`,
            boolean: `color:${palette[4]};`,
        };


        const {baseUrl, txDetail, network, txType, seqNo} = this.props;
        const {href: hrefPrev, as: asPrev} = getTxLinkData(baseUrl, network, txType, parseInt(seqNo)-1);
        const {href: hrefNext, as: asNext} = getTxLinkData(baseUrl, network, txType, parseInt(seqNo)+1);
        return (
            <Grid>
                <Grid.Row>
                    <Grid.Column>
                        <PageHeader page={txType || "home"} network={network || networks.getDefaultNetwork()}/>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={3} textAlign='center'>
                        <Link href={hrefPrev} as={asPrev}><a className="menulink">Next tx</a></Link>
                    </Grid.Column>
                    <Grid.Column width={10} textAlign='center'>
                        <h4>{`${seqNo}th ${txType} transaction`}</h4>
                    </Grid.Column>
                    <Grid.Column width={3} textAlign='center'>
                        <Link href={hrefNext} as={asNext}><a className="menulink">Prev tx</a></Link>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column>
                        <Container textAlign='justified'>
                            {<JSONPretty theme={mytheme} data={JSON.stringify(txDetail)}/> }
                        </Container>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        )
    }
}

export default Tx;
