import React, {Component} from 'react'
import "./PageHeader.scss";
import Navbar from "../Navbar/Navbar";
import {Divider, Grid} from 'semantic-ui-react';
import Router from "next/dist/lib/router";
import {Menu} from 'semantic-ui-react'
import MenuLink from "../MenuLink/MenuLink";

const networks = require('../../server/networks');

class PageHeader extends Component {

    switchNetwork(network) {
        return () => {
            Router.push(`/home?network=${network}`, `/home/${network}`);
        }
    }

    renderNetworks(networks, activeNetwork) {
        let networkMenuLinks = []
        console.log(`Networks = ${networks}`)
        for (let i = 0; i < networks.length; i++) {
            const network = networks[i];
            networkMenuLinks.push(
                <Grid.Column floated="left" width={2}>
                    <Grid>
                        <Grid.Row>
                            <MenuLink active={network === activeNetwork}
                                      href={`/home?network=${network}`}
                                      as={`/home/${network}`}>
                                {network}
                            </MenuLink>
                        </Grid.Row>
                    </Grid>
                </Grid.Column>
            )
        }
        return networkMenuLinks;
    }

    render() {
        const {network} = this.props;
        console.log(`Page header; network = ${network}`);
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
                        {this.renderNetworks(networks.getIndyNetworks(), network)}
                    </Grid.Row>

                </Grid>
                <Divider/>
            </div>
        )
    }
}

export default PageHeader;
