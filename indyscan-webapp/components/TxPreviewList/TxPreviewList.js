import {Component} from 'react';
import TxPreview from "../TxPreview/TxPreview";
import {extractTxInformation} from "../../txtools";
import {Item, Divider} from "semantic-ui-react";
import React from "react";

class TxPreviewList extends Component {

    render() {
        const {txs, network} = this.props;
        return (
            <Item.Group>
                {txs.map(tx => {
                    const txInfo = extractTxInformation(tx);
                    return (
                            <TxPreview key={`preview-${txInfo.seqNo}`}  network={network} txInfo={txInfo} ledger="domain"/>
                    )
                })}
            </Item.Group>
        )
    }
}

export default TxPreviewList;