import React, {Component} from "react";
import "./TxListItem.scss";
import {Table} from 'semantic-ui-react';
import Link from 'next/link'
import ReactTooltip from 'react-tooltip'
import {txCodeToTxType, txCodeToTxDescription} from "../../data/tx-types";
import {getTxLinkData} from '../../routing'

class TxListItem extends Component {

    render() {
        const {seqNo, type, timestamp, txnId, rootHash} = this.props.txInfo;
        const {network, txType} = this.props;
        const {baseUrl} = this.props;
        const {href, as} = getTxLinkData(baseUrl, network, txType, seqNo);
        return (
            <Table.Row className="txListItem" style={{fontSize:"0.8em", height:"100%"}}>
                <Table.Cell><Link href={href} as={as}><a>{seqNo}</a></Link></Table.Cell>
                <Table.Cell>
                    <ReactTooltip />
                    <p data-tip={txCodeToTxDescription(type)}>{txCodeToTxType(type)}</p>
                </Table.Cell>
                <Table.Cell>{timestamp}</Table.Cell>
                <Table.Cell>{txnId ? `${txnId.substring(0,50)} ...` : ""}</Table.Cell>
                <Table.Cell>{rootHash}</Table.Cell>
            </Table.Row>
        );
    }
}
export default TxListItem;
