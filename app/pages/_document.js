import Document, {Head, Main, NextScript} from "next/document";
import React from "react";
import {Container} from "semantic-ui-react";
import PageHeader from "../components/PageHeader/PageHeader";

export default class MyDocument extends Document {

    render() {
        return (
            <html>
                <Head>
                    <title>HL Indy Tx Explorer</title>
                    <link rel="stylesheet"
                          href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.3.1/semantic.min.css">
                    </link>
                    <link rel="stylesheet" href="/_next/static/style.css"/>
                </Head>
                <body>
                    <Container>
                        <PageHeader/>
                        <Main/>
                    </Container>
                    <NextScript/>
                </body>
            </html>
        );
    }
}
