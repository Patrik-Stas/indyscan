import React, {Component} from "react";
import "./TxListItem.scss";
import {Grid, GridColumn, GridRow} from 'semantic-ui-react';
import Link from "next/link";
import { Table } from 'semantic-ui-react'
import {Item} from "semantic-ui-react/dist/commonjs/views/Item/Item";

class TxListItem extends Component {
    constructor(props) {
        super(props);
        this.props = props;
    }

    render() {
        return (
            <Table.Row className="txListItem">
                    <Table.Cell>{this.props.tx.txnMetadata.seqNo}</Table.Cell>
                    <Table.Cell>{this.props.tx.txn.type}</Table.Cell>
                    <Table.Cell>{(new Date(this.props.tx.txnMetadata.txnTime * 1000)).toISOString()}</Table.Cell>
                    <Table.Cell>{this.props.tx.txnMetadata.txnId}</Table.Cell>
            </Table.Row>
        );
    }
}

export default TxListItem;
