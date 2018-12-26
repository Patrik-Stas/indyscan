import React, {Component} from "react";
import "./TxPreview.scss";
import {Card} from 'semantic-ui-react'
import Link from "next/link";
import {Image, Item} from 'semantic-ui-react'

class TxPreview extends Component {
    constructor(props) {
        super(props);
        this.props = props;
    }

    render() {
        return (
            <Item.Group>
                <Item>
                    <div className="txPreview">
                    <Item.Content>
                        <Item.Header>No: {this.props.tx.txnMetadata.seqNo}</Item.Header>
                        <Item.Meta>Type: {this.props.tx.txn.type}</Item.Meta>
                        <Item.Description>TxnId: {this.props.tx.txnMetadata.txnId}</Item.Description>
                    </Item.Content>
                    </div>
                </Item>
            </Item.Group>
        );
    }
}

export default TxPreview;
