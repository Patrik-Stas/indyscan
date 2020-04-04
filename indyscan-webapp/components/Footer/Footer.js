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
              <p/>
              <span
                style={{ marginRight: 10 }}>Do you find IndyScan useful? You can support it via paypal </span>
              <form style={{ 'display': 'inline' }} action="https://www.paypal.com/cgi-bin/webscr" method="post"
                    target="_top">
                <input type="hidden" name="cmd" value="_donations"/>
                <input type="hidden" name="business" value="patrik.stas@gmail.com"/>
                <input type="hidden" name="item_name" value="Operational cost support for indyscan.io"/>
                <input type="hidden" name="currency_code" value="EUR"/>
                <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" border="0"
                       name="submit" title="PayPal - The safer, easier way to pay online!"
                       alt="Donate with PayPal button"/>
                <img alt="" border="0" src="https://www.paypal.com/en_CZ/i/scr/pixel.gif" width="1" height="1"/>
              </form>
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
