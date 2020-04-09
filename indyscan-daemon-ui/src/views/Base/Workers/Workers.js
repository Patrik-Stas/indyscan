import React, { Component } from 'react'
import {
  Button,
  Card,
  CardBody,
  Col,
  Row,
} from 'reactstrap'
import axios from 'axios'
import { WorkersTable } from '../../components/WorkersTable'
import _ from 'lodash'
import {daemonClient, daemonQueryBuilder} from "indyscan-daemon-api-client"

class Workers extends Component {

  constructor () {
    super()
    this.state = {}
  }

  async reloadData () {
    try {
      const workersInfo  = await daemonClient.getWorkers('')
      this.setState({ workersInfo })
    } catch (e) {
      console.log(e)
    }
  }

  async componentDidMount () {
    await this.reloadData()
  }

  async onSwitchWorker (workerId) {
    await daemonClient.flipWorkers('', daemonQueryBuilder.buildWorkersQuery(null, null, null, workerId))
    await this.reloadData()
  }

  async enableAllWorkers () {
    await daemonClient.enableWorkers('')
    await this.reloadData()
  }

  async disableAllWorkers () {
    await daemonClient.disableWorkers('')
    await this.reloadData()
  }

  renderContent () {
    let networkWorkerInfos = _.groupBy(this.state.workersInfo, (worker) => worker.indyNetworkId)
    let networkTables = []
    for (const [indyNetworkId, workerInfos] of Object.entries(networkWorkerInfos)) {
      networkTables.push(
        <WorkersTable key={indyNetworkId} networkId={indyNetworkId} workers={workerInfos} onSwitchWorker={this.onSwitchWorker.bind(this)}/>
      )
    }

    return (
      <Col xs="12" md="12">
        <Card>

          <Button size="sm" color="success"
                  onClick={this.enableAllWorkers.bind(this)}><i className="fa"></i>Enable all</Button>

          <Button size="sm" color="danger"
                  onClick={this.disableAllWorkers.bind(this)}><i className="fa"></i>Disable all</Button>
          <CardBody>
            {networkTables}
          </CardBody>
        </Card>
      </Col>
    )
  }

  render () {
    return (
      <div className="animated fadeIn">
        <Row>
          {this.renderContent()}
        </Row>
      </div>
    )
  }
}

export default Workers
