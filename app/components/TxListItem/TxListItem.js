import React, {Component} from "react";
import "./TxListItem.scss";
import {Table} from 'semantic-ui-react';
import Link from 'next/link'
import {txCodeToTxType} from "../../data/tx-types";

class TxListItem extends Component {


    render() {
        console.log(`TxListItem = ${JSON.stringify(this.props)} `);
        const {seqNo, type, timestamp, txnId, rootHash} = this.props.txInfo;
        const {network, txType} = this.props;
        const {baseUrl} = this.props;
        const href=`${baseUrl}/tx?network=${network}&txType=${txType}&seqNo=${seqNo}`;
        const as=`/tx/${network}/${txType}/${seqNo}`;
        return (
            <Table.Row className="txListItem" style={{fontSize:"0.8em", height:"100%"}}>
                <Table.Cell><Link href={href} as={as}><a>{seqNo}</a></Link></Table.Cell>
                <Table.Cell>{txCodeToTxType(type)}</Table.Cell>
                <Table.Cell>{timestamp}</Table.Cell>
                <Table.Cell>{txnId ? `${txnId.substring(0,50)} ...` : ""}</Table.Cell>
                <Table.Cell>{rootHash}</Table.Cell>
            </Table.Row>
        );
    }
}
// {/*<Table.Cell>{( (this.props.tx.txnMetadata.txnTime) ?*/}
//     {/*"" : new Date(this.props.tx.txnMetadata.txnTime * 1000)).toISOString()*/}

export default TxListItem;
