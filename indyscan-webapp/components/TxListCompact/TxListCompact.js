import TxListItem from '../TxListItem/TxListItem'
import { Table, TableBody, TableHeader, TableHeaderCell, TableRow } from 'semantic-ui-react'
import React, { Component } from 'react'
// import { describeTransaction } from 'indyscan-txtype'

class TxListCompact extends Component {
  render () {
    return (
      <Table striped celled selectable>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>TxNo</TableHeaderCell>
            <TableHeaderCell>Type</TableHeaderCell>
            <TableHeaderCell>Timestamp UTC</TableHeaderCell>
            <TableHeaderCell>From DID</TableHeaderCell>
            <TableHeaderCell>Info</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {this.props.txs.map((txn) => {
            return (
              <TxListItem
                key={txn.idata.seqNo}
                baseUrl={this.props.baseUrl}
                network={this.props.network}
                ledger={this.props.ledger}
                txn={txn}
                description='Todo'
              />
            )
          })}
        </TableBody>
      </Table>
    )
  }
}

export default TxListCompact
