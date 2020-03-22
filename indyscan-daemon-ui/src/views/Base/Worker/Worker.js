import React, { Component } from 'react'
import {
  Button,
  Card,
  CardBody, CardHeader,
  Col,
  Row,
} from 'reactstrap'
import axios from 'axios'
import { daemonClient, daemonQueryBuilder } from 'indyscan-daemon-api-client'
import JSONPretty from 'react-json-pretty'

class Worker extends Component {

  constructor () {
    super()
    this.state = {}
  }

  async reloadData () {
    try {
      const workerInfo = await daemonClient.getWorker('', this.props.match.params.id)
      this.setState({ workerInfo })
    } catch (e) {
      console.log(e)
    }
  }

  async componentDidMount () {
    await this.reloadData()
  }

  async onSwitchWorker (workerId) {
    await axios.post(`/api/workers/${workerId}?flipState=true`,)
  }

  async enableAllWorker () {
    await daemonClient.enableWorkers('',
      daemonQueryBuilder.buildWorkersQuery(undefined, undefined, undefined, this.props.match.params.id)
    )
  }

  async disableAllWorker () {
    await daemonClient.disableWorkers('',
      daemonQueryBuilder.buildWorkersQuery(undefined, undefined, undefined, this.props.match.params.id)
    )
  }

  renderContent () {
    return (
      <Col xs="12" md="12">
        <Card>
          <CardBody>
            <Button size="sm" color="success"
                    onClick={this.enableAllWorker.bind(this)}><i className="fa"></i>Enable</Button>

            <Button size="sm" color="danger"
                    onClick={this.disableAllWorker.bind(this)}><i className="fa"></i>Disable</Button>
            <JSONPretty id="json-pretty" data={this.state.workerInfo}></JSONPretty>
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

export default Worker
