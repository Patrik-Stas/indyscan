import React, {Component} from "react";
import "./TxPreview.scss";
import {Item} from 'semantic-ui-react'
import Link from "next/link";
import {txTypeToTxName} from "indyscan-txtype";

class TxPreview extends Component {
    render() {
        const {seqNo, type, timestamp, txnId, rootHash, from} = this.props.txInfo;
        const {baseUrl, network, ledger} = this.props;
        const href = `${baseUrl}/tx?network=${network}&ledger=${ledger}&seqNo=${seqNo}`;
        const as = `/tx/${network}/${ledger}/${seqNo}`;
        return (
                <Item style={{marginBottom: "2em"}}>
                    <Item.Image size='tiny'>
                       <Link href={href} as={as}><a><span style={{fontSize: "2.5em"}}>{seqNo}</span></a></Link>
                    </Item.Image>
                    <Item.Content>
                        <Item.Header>{txTypeToTxName(type) || `UnknownTx:${type}`}</Item.Header>
                        <Item.Meta>{timestamp}</Item.Meta>
                        <Item.Description>RootHash: {rootHash ? `${rootHash.substring(0, 14)}` : 'n/a'}...</Item.Description>
                        <Item.Description>From {from? `${from.substring(0, 14)}` : 'n/a'}...</Item.Description>
                    </Item.Content>
                </Item>

        );
    }
}

export default TxPreview;
