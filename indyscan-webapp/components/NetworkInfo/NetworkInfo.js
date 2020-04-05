import React, { Component } from 'react'
import './NetworkInfo.scss'
import { Grid, GridColumn, GridRow } from 'semantic-ui-react'

class NetworkInfo extends Component {
  constructor (props) {
    super(props)
    this.props = props
  }

  getNetworkCaptionText () {
    const { networkDetails } = this.props
    return (networkDetails.ui['display-long'])
      ? networkDetails.ui['display-long']
      : (networkDetails.ui['display'])
        ? networkDetails.ui['display']
        : networkDetails.id
  }

  getNetworkImage () {
    const { networkDetails } = this.props
    if (networkDetails && networkDetails.ui) {
      return networkDetails.ui['logo-address']
    }
    return '/static/hlindy.png'
  }

  getNetworkDescription () {
    const { networkDetails } = this.props
    if (networkDetails && networkDetails.ui) {
      return networkDetails.ui.description
    }
    return ''
  }

  getNetworkInstructions () {
    const { networkDetails } = this.props
    if (networkDetails && networkDetails.ui) {
      return networkDetails.ui.tutorial
    }
    return ''
  }

  getNetworTutorialLink () {
    const { networkDetails } = this.props
    if (networkDetails && networkDetails.ui) {
      return networkDetails.ui['tutorial-link']
    }
    return undefined
  }

  render () {
    const tutorialLink = this.getNetworTutorialLink()
    return (
      <Grid style={{ backgroundColor: 'white', marginTop: '1em' }}>
        <GridRow>
          <GridColumn>
            <h1 className="network-header">
              <img style={{ height: '1.5em', marginRight: '1em', marginBottom: '-0.3em' }} src={this.getNetworkImage()}
                   alt="Sovrin logo"/>{this.getNetworkCaptionText()}
            </h1>
            <ul className="home-networkinfo">
              <li>{this.getNetworkDescription()}</li>
              {tutorialLink && <li>{this.getNetworkInstructions()} <a href={tutorialLink}> here</a></li>}
            </ul>
          </GridColumn>
        </GridRow>
      </Grid>
    )
  }
}

export default NetworkInfo
