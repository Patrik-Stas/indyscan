import TxListItem from '../TxListItem/TxListItem'
import { Table, TableBody, TableHeader, TableHeaderCell, TableRow } from 'semantic-ui-react'
import React, { Component } from 'react'
import './TxListCompact.scss'

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
        <TableBody className="data-content">
          {this.props.txs.map((txn) => {
            return (
              <TxListItem
                key={txn.imeta.seqNo}
                baseUrl={this.props.baseUrl}
                network={this.props.network}
                ledger={this.props.ledger}
                txn={txn}
              />
            )
          })}
        </TableBody>
      </Table>
    )
  }
}

export default TxListCompact
