import React, {Component} from 'react'
import "./PageHeader.scss";
import Navbar from "../Navbar/Navbar";
import {Grid} from 'semantic-ui-react';
import Router from "next/dist/lib/router";
import {Menu} from 'semantic-ui-react'


class PageHeader extends Component {

    switchNetwork(network) {
        return () => {
            console.log(`Switch network to: ${network}`);
            Router.push(`/home/${network}`);
        }
    }

    render() {
        const {network} = this.props;
        console.log(`[PageHeader.js] render() props= ${JSON.stringify(this.props)}`);
        return (
            <Grid id="page-header">
                <Grid.Row>
                    <h1>Hyperldeger Indy Scan</h1>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={8}>
                        <Grid id="header-left">
                            <Grid.Row>
                                <Menu>
                                    <Menu.Item active={network === "SOVRIN_MAINNET"}
                                               onClick={this.switchNetwork('SOVRIN_MAINNET')}>
                                        Sovrin MainNet
                                    </Menu.Item>

                                    <Menu.Item active={network === "SOVRIN_TESTNET"}
                                               onClick={this.switchNetwork('SOVRIN_TESTNET')}>
                                        Sovrin TestNet
                                    </Menu.Item>
                                </Menu>
                            </Grid.Row>
                        </Grid>
                    </Grid.Column>
                    <Grid.Column>
                        <Grid id="header-right">
                            <Grid.Row>
                                    <Navbar currentPath={this.props.currentPath} page={this.props.page} network={this.props.network}/>
                            </Grid.Row>
                        </Grid>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        )
    }
}

export default PageHeader;
