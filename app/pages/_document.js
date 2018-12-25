import Document, { Head, Main, NextScript } from "next/document";
import Header from "../components/Header/Header";

export default class MyDocument extends Document {
  render() {
    return (
      <html>
        <Head>
        <Header/>
          <title>HL Indy Tx Explorer</title>
          <link rel="stylesheet" href="/_next/static/style.css" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
