import { Divider, Grid } from 'semantic-ui-react'
import React, { Component } from 'react'

class Footer extends Component {
  render () {
    return (
      <div>
        <Divider/>
        <Grid>
          <Grid.Row>
            <Grid.Column textAlign='center' style={{ fontSize: '1rem' }}>
              <span style={{ marginRight: 10 }}>Support internet, your privacy and this project by using </span>
              <a href='https://brave.com/ind682'><img style={{ height: '1.4rem' }}
                                                      src='/static/brave-bat-partnership.png'/></a>
            </Grid.Column>
          </Grid.Row>
          {this.props.displayVersion &&
          <Grid.Row>
            <Grid.Column textAlign='center'>
              <p style={{ fontSize: '0.9rem' }}>Indyscan Explorer version: {this.props.displayVersion}</p>
            </Grid.Column>
          </Grid.Row>
          }
        </Grid>
      </div>
    )
  }
}

export default Footer
