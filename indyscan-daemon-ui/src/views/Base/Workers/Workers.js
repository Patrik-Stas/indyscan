import React, { Component } from 'react'
import {
  Button,
  Card,
  CardBody, CardHeader,
  Col,
  Row,
} from 'reactstrap'
import axios from 'axios'
import { WorkersTable } from '../../components/WorkersTable'
import util from 'util'
import _ from 'lodash'
import daemonApiClient from "indyscan-daemon-api-client"

class Workers extends Component {

  constructor () {
    super()
    this.state = {}
  }

  async reloadData () {
    try {
      const { data: workersInfo } = await daemonApiClient.getWorkers()
      this.setState({ workersInfo })
    } catch (e) {
      console.log(e)
    }
  }

  async componentDidMount () {
    console.log(`Mounted.`)
    await this.reloadData()
  }

  async onSwitchWorker (workerId) {
    console.log(`Click worker ${util.inspect(workerId)}`)
    await axios.post(`/api/workers/${workerId}?flipState=true`, )
  }

  async enableAllWorkers () {
    await axios.post(`/api/workers?enabled=true`)
  }

  async disableAllWorkers () {
    await axios.post(`/api/workers?enabled=false`)
  }

  renderContent () {
    let networkWorkerInfos = _.groupBy(this.state.workersInfo, (worker) => worker.indyNetworkId)
    let networkTables = []
    for (const [indyNetworkId, workerInfos] of Object.entries(networkWorkerInfos)) {
      networkTables.push(
        <WorkersTable key={indyNetworkId} networkId={indyNetworkId} workers={workerInfos} onSwitchWorker={this.onSwitchWorker}/>
      )
    }

    return (
      <Col xs="12" md="12">
        <Card>

          <Button size="sm" color="success"
                  onClick={this.enableAllWorkers}><i className="fa"></i>Enable all</Button>

          <Button size="sm" color="danger"
                  onClick={this.disableAllWorkers}><i className="fa"></i>Disable all</Button>
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
