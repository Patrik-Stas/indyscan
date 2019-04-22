import { Component } from 'react'
import TxListItem from '../TxListItem/TxListItem'
import { Table, TableBody, TableHeader, TableHeaderCell, TableRow } from 'semantic-ui-react'
import { extractTxInformation } from '../../txtools'
import React from 'react'
import { describeTransaction } from 'indyscan-txtype'

class TxListCompact extends Component {

  render () {
    console.log(`render tx list compact ::::`)
    console.log(JSON.stringify(this.props.txType))

    return (
      <Table striped celled selectable>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>TxNo</TableHeaderCell>
            <TableHeaderCell>Type</TableHeaderCell>
            <TableHeaderCell>Timestamp</TableHeaderCell>
            <TableHeaderCell>TxID</TableHeaderCell>
            <TableHeaderCell>RootHash</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {this.props.txs.map((txn) => {
            const txInfo = extractTxInformation(txn)
            const description = describeTransaction(txn)
            return (
              <TxListItem baseUrl={this.props.baseUrl}
                          network={this.props.network}
                          ledger={this.props.txType}
                          key={txn.seqNo}
                          txInfo={txInfo}
                          description={description}
              />
            )
          })}
        </TableBody>
      </Table>
    )
  }
}

export default TxListCompact