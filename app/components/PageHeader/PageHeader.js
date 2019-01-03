import React, {Component} from 'react'
import "./PageHeader.scss";
import Navbar from "../Navbar/Navbar";
import {Grid} from 'semantic-ui-react';
import Router from "next/dist/lib/router";
import {Menu} from 'semantic-ui-react'
import MenuLink from "../MenuLink/MenuLink";


class PageHeader extends Component {

    switchNetwork(network) {
        return () => {
            Router.push(`/home?network=${network}`, `/home/${network}`);
        }
    }

    render() {
        const {network} = this.props;
        return (
            <Grid id="page-header">
                <Grid.Row>
                    <h1>IndyScan</h1>
                </Grid.Row>
                <Grid.Row style={{marginTop: "-2em"}}>
                    <h5>Hyperledger Indy transaction explorer</h5>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column floated="left" width={8}>
                        <Grid>
                            <Grid.Row>
                                <MenuLink active={network === "SOVRIN_MAINNET"} href={`home?network=SOVRIN_MAINNET`}
                                          as={`/home/SOVRIN_MAINNET`}>
                                    MainNet
                                </MenuLink>
                                <MenuLink active={network === "SOVRIN_TESTNET"} href={`home?network=SOVRIN_TESTNET`}
                                          as={`/home/SOVRIN_TESTNET`}>
                                    TestNet
                                </MenuLink>
                            </Grid.Row>
                        </Grid>
                    </Grid.Column>
                    <Grid.Column floated="right" width={5}>
                        <Grid>
                            <Grid.Row>
                                <Navbar page={this.props.page} network={this.props.network}/>
                            </Grid.Row>
                        </Grid>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        )
    }
}

export default PageHeader;
