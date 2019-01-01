import React, {Component} from "react";
import "./Navbar.scss";
import {Input, Menu, Segment} from 'semantic-ui-react'
import Router from 'next/router'
import Link from "next/link";

class Navbar extends Component {
    constructor(props) {
        super(props);
        this.props = props;
    }

    homePage(indyNetwork) {
        console.log(`Go to homepage for network ${indyNetwork}`);
        return () => Router.push(`/home?network=${indyNetwork}`, `/home/${indyNetwork}`);
    }

    transactionsPage(indyNetwork, txType) {
        return () => Router.push(`/txs?network=${indyNetwork}&txType=${txType}`, `/txs/${indyNetwork}/${txType}`);
    }

    // href={`/home?network=${indyNetwork}`
    //href={`/txs?network=${indyNetwork}&txType=domain`} as={`/txs/${indyNetwork}/domain`}
    //href={`/txs?network=${indyNetwork}&txType=pool`} as={`/txs/${indyNetwork}/pool`}>
    //href={`/txs?network=${indyNetwork}&txType=config`} as={`/txs/${indyNetwork}/config`}>

    render() {
        const {network, page} = this.props;
        console.log(`navbar page = ${page}`);
        console.log(`[Navbar.js] render() props= ${JSON.stringify(this.props)}`);
        return (
            <Menu>
                <Menu.Item onClick={this.homePage(network)} active={page==="home"}>
                    Home
                </Menu.Item>
                <Menu.Item onClick={this.transactionsPage(network, 'domain')} active={page==="domain"}>
                    Domain
                </Menu.Item>
                <Menu.Item onClick={this.transactionsPage(network, 'pool')} active={page==="pool"}>
                    Pool
                </Menu.Item>
                <Menu.Item onClick={this.transactionsPage(network, 'config')} active={page==="config"}>
                    Config
                </Menu.Item>
            </Menu>
        );
    }
}

export default Navbar;

{/*<Link href={`/home?network=${indyNetwork}`}>*/
}
{/*<a title="Our API">Home</a>*/
}
{/*</Link>*/
}
{/*<Link href={`/txs?network=${indyNetwork}&txType=domain`} as={`/txs/${indyNetwork}/domain`}>*/
}
{/*<a title="About Next JS">Domain</a>*/
}
{/*</Link>*/
}
{/*<Link href={`/txs?network=${indyNetwork}&txType=pool`} as={`/txs/${indyNetwork}/pool`}>*/
}
{/*<a title="About Next JS">Pool</a>*/
}
{/*</Link>*/
}
{/*<Link href={`/txs?network=${indyNetwork}&txType=config`} as={`/txs/${indyNetwork}/config`}>*/
}
{/*<a title="About Next JS">Config</a>*/
}
{/*</Link>*/
}