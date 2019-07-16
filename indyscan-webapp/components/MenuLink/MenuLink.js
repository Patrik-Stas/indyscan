import React, {Component} from "react";
import Link from 'next/link'
import './MenuLink.scss'

class MenuLink extends Component {
    constructor(props) {
        super(props);
        this.props = props;
    }

    render() {
        const {href, as, active} = this.props;
        let fontSize = "1.2em";
        let color= (!!active) ? "darkcyan" : "black"
        return (
            <Link href={href} as={as}><a className="menulink" style={{marginRight:'1.5em', color:color, fontSize:fontSize}}>{this.props.children}</a></Link>
        );
    }
}

export default MenuLink;
