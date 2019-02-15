import {Divider, Grid} from "semantic-ui-react";
import React, {Component} from "react";

class Footer extends Component {

    render() {
        return (
            <div>
                <Divider/>
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={8} floated='right' textAlign='center' style={{fontSize: '1rem'}}>
                            <p>Support this project by downloading and using privacy preserving web-browser Brave</p>
                        </Grid.Column>
                        <Grid.Column width={8} floated='left' textAlign='center'>
                            <a href="https://brave.com/ind682"><img style={{height: '2.5rem'}}
                                                                    src='/static/brave-bat-partnership.png'/></a>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        );
    }
}

export default Footer;