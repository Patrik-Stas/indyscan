import {Component} from 'react';
import TxPreview from "../TxPreview/TxPreview";
import {extractTxInformation} from "../../txtools";

class TxList extends Component {

    render() {
        const {txs} = this.props;
        return (
            <div>
                {txs.map(tx => {
                    const txInfo = extractTxInformation(tx);
                    return (
                        <TxPreview key={tx.seqNo} {...txInfo}/>
                    )
                })}
            </div>
        )
    }
}

export default TxList;