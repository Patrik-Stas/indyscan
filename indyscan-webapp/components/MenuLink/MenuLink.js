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
        let fontSize = "1.3em";
        let color= (!!active) ? "darkcyan" : "black"
        return (
            <Link href={href} as={as}><a className="menulink" style={{marginRight:'2em', color:color, fontSize:fontSize}}>{this.props.children}</a></Link>
        );
    }
}

export default MenuLink;
