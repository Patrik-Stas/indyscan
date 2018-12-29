import React from 'react'
import App, { Container } from 'next/app'
import {Container as SemanticContainer} from "semantic-ui-react";
import PageHeader from "../components/PageHeader/PageHeader";
import {Head} from "next/dist/server/document";
import Router from "next/dist/lib/router";
import util from 'util';
export default class MyApp extends App {
    static async getInitialProps({ Component, router, ctx }) {
        console.log(router.asPath);
        let pageProps = {}

        if (Component.getInitialProps) {
            pageProps = await Component.getInitialProps(ctx)
        }

        return { pageProps, currentPath: router.asPath }
    }


    async componentDidMount() {
        console.log(`App mounted`);
        // console.log(Router.pathname);
        // console.log(Router.route);
    }


    render () {
        const { Component, pageProps, currentPath } = this.props
        return (
            <Container>
                <title>HL Indy Tx Explorer</title>
                <SemanticContainer>
                    <PageHeader currentPath={currentPath}/>
                    <Component {...pageProps}/>
                </SemanticContainer>
            </Container>
        )
    }
}