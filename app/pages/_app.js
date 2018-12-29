import React from 'react'
import App, { Container } from 'next/app'
import {Container as SemanticContainer} from "semantic-ui-react";
import PageHeader from "../components/PageHeader/PageHeader";
import {Head} from "next/dist/server/document";

export default class MyApp extends App {
    static async getInitialProps({ Component, router, ctx }) {
        let pageProps = {}

        if (Component.getInitialProps) {
            pageProps = await Component.getInitialProps(ctx)
        }

        return { pageProps }
    }

    render () {
        const { Component, pageProps } = this.props
        return (
            <Container>
                <title>HL Indy Tx Explorer</title>
                <SemanticContainer>
                    <PageHeader/>
                    <Component {...pageProps} />
                </SemanticContainer>
            </Container>
        )
    }
}