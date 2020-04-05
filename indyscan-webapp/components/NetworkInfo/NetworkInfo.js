import React, { Component } from 'react'
import './NetworkInfo.scss'
import { Grid, GridColumn, GridRow } from 'semantic-ui-react'

class NetworkInfo extends Component {
  constructor (props) {
    super(props)
    this.props = props
  }

  render () {
    const { networkDetails } = this.props

    return (
      <Grid style={{ backgroundColor: 'white', marginTop: '1em' }}>
        <GridRow >
          <GridColumn>
            <h1 className="network-header">
              <img style={{ height: '1.5em', marginRight:'1em', marginBottom:'-0.3em' }} src="/static/sovrin.png" alt="Sovrin logo"/>{networkDetails.ui['display-long'] ? networkDetails.ui['display-long'] : (networkDetails.ui['display']) ? networkDetails.ui['display'] : networkDetails.id}
            </h1>
            <ul className="home-networkinfo">
              {
                (networkDetails.ui.description) && <li>{networkDetails.ui.description}</li>
              }
              {
                (networkDetails.ui.tutorial) && <li>{networkDetails.ui.tutorial}<a href={networkDetails.ui["tutorial-link"]}> here</a></li>
              }
            </ul>
          </GridColumn>
        </GridRow>
      </Grid>
    )
  }
}

export default NetworkInfo
