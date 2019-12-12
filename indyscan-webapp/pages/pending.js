import '../scss/style.scss'
import React, { Component } from 'react'
import { Grid, GridRow } from 'semantic-ui-react'
import { getBaseUrl } from '../routing'
import Link from 'next/link'

class Txs extends Component {
  static async getInitialProps ({ req, query }) {
    const baseUrl = getBaseUrl(req)
    return {
      baseUrl
    }
  }

  render () {
    const { baseUrl } = this.props
    return (
      <Grid>
        <GridRow style={{ marginTop: '0.1em' }}>
          <span>Something went wrong. <a href='/'>Try again?</a>
            <Link href={baseUrl} as='/'><a className='menulink'>Agaoin</a></Link>
          </span>
        </GridRow>
      </Grid>
    )
  }
}

export default Txs
