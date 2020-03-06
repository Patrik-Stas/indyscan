import React, { Component } from 'react'
import {
  Card,
  CardBody,
  Col,
  Row,
} from 'reactstrap'
import axios from 'axios'
import { WorkersTable } from '../../components/WorkersTable'

class Workers extends Component {

  constructor () {
    super()
    this.state = {
      agentProvision: {},
      updateLogoUrl: ''
    }
  }

  async reloadData () {
    try {
      const { data: workersInfo } = await axios.get('/api/workers')
      this.setState({ workersInfo })
    } catch (e) {
      console.log(e)
    }
  }

  async componentDidMount () {
    console.log(`Mounted.`)
    await this.reloadData()
  }

  onAgentUpdateSubmit = async (event) => {
    event.preventDefault()
    this.reloadData()
  }

  renderAgent () {
    return (
      <Col xs="12" md="12">
        <Card>
          <CardBody>
            <WorkersTable workers={this.state.workersInfo}/>
          </CardBody>
        </Card>
      </Col>
    )
  }

  render () {
    return (
      <div className="animated fadeIn">
        <Row>
          {this.renderAgent()}
        </Row>
      </div>
    )
  }
}

export default Workers
