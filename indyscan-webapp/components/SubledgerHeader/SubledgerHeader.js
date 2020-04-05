import React, { Component } from 'react'
import './SubledgerHeader.scss'
import { CircularProgressbar } from 'react-circular-progressbar'
import { SemipolarSpinner } from 'react-epic-spinners'

class SubledgerHeader extends Component {
  constructor (props) {
    super(props)
    this.props = props
  }

  render () {
    let { subledger, progress, isInteractive } = this.props
    if (!isInteractive) {
      return <h2>
        <span className="status-wrapper">{subledger} txs</span>
      </h2>
    }
    if (progress === undefined) {
      progress = 0
    }
    const displayProgressbar = (progress < 92)
    const displaySpinner = !displayProgressbar

    return (
      <h2>
        <span className="status-wrapper">
          {displayProgressbar &&
          <CircularProgressbar className="subledger-status" value={progress}/>
          }
          {displaySpinner &&
          <SemipolarSpinner size={38} className="subledger-status" color="darkcyan"/>
          }
          {subledger} txs
          </span>
      </h2>
    )
  }
}

export default SubledgerHeader
