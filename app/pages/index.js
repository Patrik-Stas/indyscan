import Head from "next/head";
import {Component} from 'react';
import "../scss/style.scss";
import Navbar from "../components/Navbar";
import fetch from 'isomorphic-unfetch'
import TxPreview from "../components/TxPreview";
import Pagination from  'rc-pagination';
import {Container} from 'semantic-ui-react';

class Index extends Component {

    static async getInitialProps({req, query}) {
        console.log(`Get initial props is running!`);

        const baseUrl = req ? `${req.protocol}://${req.get('Host')}` : '';
        let res = await fetch(`${baseUrl}/api/movies`);
        let props = await res.json();
        console.log(props);

        return props
    }

    onNextTxPage(foo, bar) {

    }


    render() {
        return (
            <Container>
                <Head/>
                <h1>Hyperldeger Indy Scan</h1>
                <Navbar/>
                <div>
                    {this.props.txs.map(txn => <TxPreview tx={txn}/>)}
                </div>
                {/*<Pagination current={2} total={50} onChange={this.onNextTxPage}/>*/}
            </Container>
        )
    }
}

export default Index;
