import React from 'react'
import App, { Container } from 'next/app'
import { Container as SemanticContainer } from 'semantic-ui-react'
import { CSSTransition } from 'react-transition-group'
import util from 'util'
import getWebsocketClient from '../context/socket-client'

export default class MyApp extends App {
  static async getInitialProps ({ Component, router, ctx }) {
    let pageProps = {}
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }
    return { pageProps }
  }

  switchSocketRoom (indyNetworkId) {
    let socket = getWebsocketClient()
    // console.log(`app.js switchSocketRoom ${indyNetworkId}`)
    socket.emit('switch-room', indyNetworkId)
  }

  tryEnterWsRoomForNetwork(networkDetails) {
    if (networkDetails) {
      const { id: indyNetworkId } = networkDetails
      if (indyNetworkId) {
        this.switchSocketRoom(indyNetworkId)
      }
    }
  }

  componentDidMount () {
    const { networkDetails } = this.props.pageProps
    this.tryEnterWsRoomForNetwork(networkDetails)
  }

  componentWillReceiveProps (newProps) {
    const { networkDetails } = newProps.pageProps
    this.tryEnterWsRoomForNetwork(networkDetails)
  }

  render () {
    const { Component, pageProps } = this.props
    const { ledger, network } = pageProps
    return (
      <Container>
        <title>HL Indy Tx Explorer</title>
        <SemanticContainer>
          <CSSTransition key={JSON.stringify({ ledger, network })} appear={true} in={true} timeout={300}
                         classNames="pageanimation">
            <Component {...pageProps} />
          </CSSTransition>
        </SemanticContainer>
      </Container>
    )
  }
}
