import React from 'react'
import App, { Container } from 'next/app'
import {Container as SemanticContainer} from "semantic-ui-react";
import PageHeader from "../components/PageHeader/PageHeader";
import util from 'util';

export default class MyApp extends App {
    static async getInitialProps({ Component, router, ctx }) {
        // console.log(`[_app.js] beginning of getInitialProps()...\n... ctx= ${util.inspect(ctx)} .... \n ... router= ${util.inspect(router)} `);
        console.log(`[_app.js] beginning of getInitialProps()`);
        // console.log(`MyApp. router.asPath = ${router.asPath}`);
        let pageProps = {};

        if (Component.getInitialProps) {
            pageProps = await Component.getInitialProps(ctx)
        }
        // console.log(`[_app.js] end of getInitialProps() : query= ${JSON.stringify(router.query)} pageProps=${JSON.stringify(pageProps)}`);
        // console.log(`[_app.js] end of getInitialProps() : query= ${JSON.stringify(router.query)} pageProps=${JSON.stringify(pageProps)}`);
        return { pageProps, currentPath: router.asPath}
    }


    render () {
        const { Component, pageProps, currentPath, query } = this.props;
        return (
            <Container>
                <title>HL Indy Tx Explorer</title>
                <SemanticContainer>
                    <Component {...pageProps} currentPath={currentPath}/>
                </SemanticContainer>
            </Container>
        )
    }
}