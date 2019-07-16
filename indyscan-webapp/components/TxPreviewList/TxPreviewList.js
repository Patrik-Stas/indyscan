import {Component} from 'react';
import TxPreview from "../TxPreview/TxPreview";
import {extractTxInformation} from "../../txtools";
import {Item, ItemGroup, Divider} from "semantic-ui-react";
import React from "react";

class TxPreviewList extends Component {

    render() {
        const {txs, network, subledger} = this.props;
        return (
            <ItemGroup>
                {
                    txs.map(tx => {
                    const txInfo = extractTxInformation(tx);
                    return (
                            <TxPreview key={`preview-${txInfo.seqNo}`}  network={network} txInfo={txInfo} ledger={subledger}/>
                        )
                    })
                }
            </ItemGroup>
        )
    }
}

export default TxPreviewList;
