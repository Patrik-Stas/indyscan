import React, {Component} from "react";
import "./TxListItem.scss";
import {Table} from 'semantic-ui-react';
import {Item} from "semantic-ui-react/dist/commonjs/views/Item/Item";
import Router from "next/dist/lib/router";
import {txCodeToTxType} from "../../data/tx-types";

class TxListItem extends Component {

    static goToTx(baseUrl, network, txType, seqNo) {
        return () => Router.push(
            `${baseUrl}/tx?network=${network}&txType=${txType}&seqNo=${seqNo}`,
            `/tx/${network}/${txType}/${seqNo}`
        );
    }

    render() {
        console.log(`TxListItem = ${JSON.stringify(this.props)} `);
        const {seqNo, type, timestamp, txnId} = this.props.txInfo;
        const {network, txType} = this.props;
        const {baseUrl} = this.props;
        return (
            <Table.Row className="txListItem" onClick={TxListItem.goToTx(baseUrl, network, txType, seqNo)}>
                    <Table.Cell>{seqNo}</Table.Cell>
                    <Table.Cell>{txCodeToTxType(type)}</Table.Cell>
                    <Table.Cell>{timestamp}</Table.Cell>
                    <Table.Cell>{txnId}</Table.Cell>
            </Table.Row>
        );
    }
}
// {/*<Table.Cell>{( (this.props.tx.txnMetadata.txnTime) ?*/}
//     {/*"" : new Date(this.props.tx.txnMetadata.txnTime * 1000)).toISOString()*/}

export default TxListItem;
