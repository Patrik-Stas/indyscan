import React, {Component} from "react";
import Link from 'next/link'
import './MenuLink.scss'

class MenuLink extends Component {
    constructor(props) {
        super(props);
        this.props = props;
    }

    render() {
        const {href, as} = this.props;
        return (
            <Link href={href} as={as}><a className="menulink" style={{marginRight:'2em', fontSize:"1.4em"}}>{this.props.children}</a></Link>
        );
    }
}

export default MenuLink;
