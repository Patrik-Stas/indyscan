import React, {Component} from "react";
import "./TxPreview.scss";
import {Item, Icon} from 'semantic-ui-react'
import {txCodeToTxType} from "../../data/tx-types";

class TxPreview extends Component {
    render() {
        const {seqNo, type, timestamp, txnId} = this.props.txInfo;
        return (
            <Item>
                <Item.Image size='tiny'>
                    <h1>{seqNo}</h1>
                </Item.Image>
                {/*<Item.Image size='tiny' src='https://react.semantic-ui.com/images/wireframe/image.png' />*/}
                <Item.Content>
                    <Item.Header>{txCodeToTxType(type)}</Item.Header>
                    <Item.Meta>{timestamp}</Item.Meta>
                    <Item.Description>{`${txnId.substring(0,15)} ...`}</Item.Description>
                </Item.Content>
            </Item>

        );
    }
}

export default TxPreview;
