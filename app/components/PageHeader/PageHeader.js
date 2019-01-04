import React, {Component} from 'react'
import "./PageHeader.scss";
import Navbar from "../Navbar/Navbar";
import {Divider, Grid} from 'semantic-ui-react';
import Router from "next/dist/lib/router";
import {Menu} from 'semantic-ui-react'
import MenuLink from "../MenuLink/MenuLink";


class PageHeader extends Component {

    switchNetwork(network) {
        return () => {
            Router.push(`/home?network=${network}`, `/home/${network}`);
        }
    }

    //<span style={{color:"#1F5289"}}> // indy color
    render() {
        const {network} = this.props;
        return (
            <div>
                <Grid id="page-header">
                    <Grid.Row>
                        <h1><span style={{color: "darkcyan"}}>IndyScan</span></h1>
                    </Grid.Row>
                    <Grid.Row style={{marginTop: "-2em"}}>
                        <h5>Hyperledger Indy transaction explorer</h5>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column floated="left" width={8}>
                            <Grid>
                                <Grid.Row>
                                    <MenuLink active={network === "SOVRIN_MAINNET"}
                                              href={`/home?network=SOVRIN_MAINNET`}
                                              as={`/home/SOVRIN_MAINNET`}>
                                        MainNet
                                    </MenuLink>
                                    <MenuLink active={network === "SOVRIN_TESTNET"}
                                              href={`/home?network=SOVRIN_TESTNET`}
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
                <Divider/>
            </div>
        )
    }
}

export default PageHeader;
