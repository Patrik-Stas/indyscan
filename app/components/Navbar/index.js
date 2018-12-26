import React, { Component } from "react";
import Link from "next/link";
import "./Navbar.scss";

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  render() {
    return (
      <nav>
        <div>
          <Link href="/">
            <a title="Our API">Home</a>
          </Link>
          <Link href="/tx-domain">
            <a title="About Next JS">Domain</a>
          </Link>

          <Link href="/tx-network">
              <a title="About Next JS">Network</a>
          </Link>

            <Link href="/tx-config">
                <a title="About Next JS">Config</a>
            </Link>

          <Link href="/about">
              <a title="About Next JS">About</a>
          </Link>
        </div>
      </nav>
    );
  }
}

export default Navbar;
