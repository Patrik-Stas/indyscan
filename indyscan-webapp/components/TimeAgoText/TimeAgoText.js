import React, { Component } from 'react'
import { secondsToDhms } from '../../txtools'

class TimeAgoText extends Component {

  constructor () {
    super()
    this.state = {}
  }

  calculateTimeSinceLastTransaction = function calculateTimeSinceLastTransaction (sinceEpoch) {
    const utimeNow = Math.floor(new Date())
    return secondsToDhms((utimeNow - sinceEpoch) / 1000)
  }

  refreshTimesSinceLast () {
    const { sinceEpoch } = this.props
    let sinceSinceTx = this.calculateTimeSinceLastTransaction(sinceEpoch)
    sinceSinceTx = (sinceSinceTx) ? sinceSinceTx : 'Unknown'
    this.setState({ sinceSinceTx })
  }

  componentDidMount () {
    this.refreshTimesSinceLast()
    this.interval = setInterval(this.refreshTimesSinceLast.bind(this), 1000)
  }

  componentWillUnmount () {
    clearInterval(this.interval)
  }

  render () {
    return (
      <span className={this.props.className}>{this.state.sinceSinceTx} ago</span>
    )
  }
}

export default TimeAgoText
