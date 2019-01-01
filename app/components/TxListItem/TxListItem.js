import React, {Component} from "react";
import "./TxListItem.scss";
import {Table} from 'semantic-ui-react';
import {Item} from "semantic-ui-react/dist/commonjs/views/Item/Item";

class TxListItem extends Component {
    constructor(props) {
        super(props);
        this.props = props;
    }

    render() {
        const timestamp = !!(this.props.tx.txnMetadata.txnTime)
            ?  new Date(this.props.tx.txnMetadata.txnTime * 1000).toISOString()
            : "unknown";
        return (
            <Table.Row className="txListItem">
                    <Table.Cell>{this.props.tx.txnMetadata.seqNo}</Table.Cell>
                    <Table.Cell>{this.props.tx.txn.type}</Table.Cell>
                    <Table.Cell>{timestamp}</Table.Cell>
                    <Table.Cell>{this.props.tx.txnMetadata.txnId}</Table.Cell>
            </Table.Row>
        );
    }
}
// {/*<Table.Cell>{( (this.props.tx.txnMetadata.txnTime) ?*/}
//     {/*"" : new Date(this.props.tx.txnMetadata.txnTime * 1000)).toISOString()*/}

export default TxListItem;
