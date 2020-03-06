import React, { Component } from 'react'
import {
  Badge,
  Card,
  CardBody,
  Col,
  Table
} from 'reactstrap'
import _ from 'lodash'
import JSONPretty from 'react-json-pretty'

export function getWorkerStatusStyle (enabled) {
  if (enabled) {
    return { text: 'enabled', color: 'success' }
  } else {
    return { text: 'disabled', color: 'danger' }
  }
}

export class WorkersTable extends Component {

  render () {
    return (
      <Col xs="12" lg="12">
        <Card>
          <CardBody>
            <Table responsive size="sm">
              <thead>
              <tr>
                <th>Status</th>
                <th>Indy Network ID</th>
                <th>Component ID</th>
                <th>Initialized</th>
                <th>Enabled</th>
                <th>Output format</th>
              </tr>
              </thead>
              <tbody>
              {
                _(this.props.workers).values().map((worker) => {
                  const { text, color } = getWorkerStatusStyle(worker.enabled)
                  return (
                    <tr key={worker.componentId}>
                      <td>
                        <Badge color={color}>{text}</Badge>
                      </td>
                      <td>{worker.indyNetworkId}</td>
                      <td>{worker.componentId}</td>
                      <td>{worker.initialzed.toString()}</td>
                      <td>{worker.enabled.toString()}</td>
                      <td>{worker.outputFormat}</td>
                      <JSONPretty id="json-pretty" data={worker}/>
                    </tr>
                  )
                }).value()
              }
              </tbody>
            </Table>
          </CardBody>
        </Card>
      </Col>
    )
  }
}
