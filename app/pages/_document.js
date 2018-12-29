import Document, {Head, Main, NextScript} from "next/document";
import React from "react";

export default class MyDocument extends Document {

    render() {
        return (
            <html>
                <Head>
                    <link rel="stylesheet"
                          href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.3.1/semantic.min.css">
                    </link>
                    <link rel="stylesheet" href="/_next/static/style.css"/>
                </Head>
                <body>
                    <Main/>
                    <NextScript/>
                </body>
            </html>
        );
    }
}
