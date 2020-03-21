import React, { Component } from 'react'
import {
  Badge, Button,
  Card,
  CardBody, CardHeader,
  Col,
  Table
} from 'reactstrap'
import _ from 'lodash'

export function getWorkerStatusStyle (enabled) {
  if (enabled) {
    return { text: 'enabled', color: 'success' }
  } else {
    return { text: 'disabled', color: 'danger' }
  }
}

export function getWorkerInitializedStatusStyle (enabled) {
  if (enabled) {
    return { text: 'initialized', color: 'success' }
  } else {
    return { text: 'uninitialized', color: 'danger' }
  }
}

export class WorkersTable extends Component {

  render () {
    return (
      <Col xs="12" lg="12">
        <Card>
          <CardHeader>
            <h3>Network <Badge color="dark">{this.props.networkId}</Badge></h3>
          </CardHeader>
          <CardBody>
            <Table responsive size="sm">
              <thead>
              <tr>
                <th></th>
                <th>Initialized</th>
                <th>Status</th>
                <th>Operation Type</th>
                <th>Component ID</th>
                <th>Transformation</th>
                <th>Cycles</th>
                <th>Processed</th>
                <th>N/As</th>
                <th>Errors</th>
              </tr>
              </thead>
              <tbody>
              {
                _(this.props.workers).values().map((worker) => {
                  const { text: textStatus, color: colorStatus } = getWorkerStatusStyle(worker.enabled)
                  const { text: textInitialized, color: colorInitialized } = getWorkerInitializedStatusStyle(worker.initialized)
                  return (
                    <tr key={worker.componentId}>
                      <td>
                        <Button size="sm" color="primary"
                                onClick={this.props.onSwitchWorker.bind(null, worker.componentId)}><i className="fa"></i>Start/Stop</Button>
                      </td>
                      <td>
                        <Badge color={colorInitialized}>{textInitialized}</Badge>
                      </td>
                      <td>
                        <Badge color={colorStatus}>{textStatus}</Badge>
                      </td>
                      {
                        worker.operationType === 'expansion'
                          ? <td><Badge color="info">{worker.operationType}</Badge></td>
                          : <td><Badge color="primary">{worker.operationType}</Badge></td>
                      }

                      <td>{worker.componentId}</td>
                      <td>
                        <Badge>{worker.transformerInfo}</Badge>
                      </td>
                      <td>{worker.requestCycleCount}</td>
                      <td>{worker.processedTxCount}</td>
                      <td>{worker.txNotAvailableCount}</td>
                      <td>{worker.cycleExceptionCount}</td>
                      {/*<JSONPretty id="json-pretty" data={worker}/>*/}
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
