import Head from "next/head";
import {Component} from 'react';
import "../scss/style.scss";
import Navbar from "../components/Navbar";
import fetch from 'isomorphic-unfetch'
import TxPreview from "../components/TxPreview";

class Index extends Component {

    static async getInitialProps({req, query}) {
        console.log(`Get initial props is running!`);

        const baseUrl = req ? `${req.protocol}://${req.get('Host')}` : '';
        let res = await fetch(`${baseUrl}/api/movies`);
        let props = await res.json();
        console.log(props);

        return props
    }


    render() {
        return (
            <section className="page-section">
                <Head>
                    <title>Hello World</title>
                </Head>
                <Navbar/>
                <h1>Hyperldeger Indy Scan</h1>
                <div className="container mx-auto">
                    {this.props.txs.map(txn => <TxPreview tx={txn}/>)}
                </div>
            </section>
        )
    }
}

export default Index;
