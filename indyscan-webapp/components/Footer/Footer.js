import {Divider, Grid} from "semantic-ui-react";
import React, {Component} from "react";

class Footer extends Component {

    render() {
        return (
            <div>
                <Divider/>
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={5} floated='left' textAlign='center'>
                            <a href="https://brave.com/ind682"><img style={{height: '3rem'}}
                                                                    src='/static/brave-bat-partnership.png'/></a>
                        </Grid.Column>
                        <Grid.Column width={11} floated='left' textAlign='left' style={{fontSize: '1rem'}}>
                            <span>Support internet, your privacy and this project by </span><a href="https://brave.com/ind682">being Brave</a>.
                            <p/>
                                <a href="https://www.linkedin.com/pulse/better-browser-internet-patrik-sta%C5%A1/">What's Brave?</a>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        );
    }
}

export default Footer;