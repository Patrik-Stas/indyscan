import React, {Component} from "react";
import "./TxPreview.scss";
import {Item} from 'semantic-ui-react'

class TxPreview extends Component {
    render() {
        return (
            <Item.Group>
                <Item>
                    <div className="txPreview">
                    <Item.Content>
                        <Item.Header>No: {this.props.seqNo}</Item.Header>
                        <Item.Meta>Type: {this.props.type}</Item.Meta>
                        <Item.Meta>Timestamp: {(new Date(this.props.txnTime * 1000)).toISOString()}</Item.Meta>
                        <Item.Description>TxnId: {this.props.txnId}</Item.Description>
                    </Item.Content>
                    </div>
                </Item>
            </Item.Group>
        );
    }
}

export default TxPreview;
