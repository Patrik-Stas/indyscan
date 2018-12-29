import React, {Component} from 'react'
import "./PageHeader.scss";
import Navbar from "../Navbar/Navbar";
import {Grid} from 'semantic-ui-react';

class PageHeader extends Component {

    render() {
        return (
            <div>
                <Grid id="page-header">
                    <Grid.Row>
                        <Grid.Column width={8}>
                            <h1>Hyperldeger Indy Scan</h1>
                        </Grid.Column>
                        <Grid.Column width={8}>
                            <Navbar/>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>

            </div>
        )
    }
}

export default PageHeader;
