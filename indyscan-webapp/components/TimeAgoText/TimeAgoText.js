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
    if (this.props.sinceEpoch) {
      this.refreshTimesSinceLast()
      this.interval = setInterval(this.refreshTimesSinceLast.bind(this), 1000)
    }
  }

  componentWillUnmount () {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  render () {
    const {sinceSinceTx} = this.state
    return (
      (!!sinceSinceTx)
        ? <span className={this.props.className}>{sinceSinceTx} ago</span>
        : <span><b><i>Genesis transaction</i></b></span>

    )
  }
}

export default TimeAgoText
