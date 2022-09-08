import React, { useState } from 'react'
import './BadgedValueDisplay.scss'
import { Icon, Label, List } from 'semantic-ui-react'
import ReactTooltip from 'react-tooltip'
import { renderValuesAsBadges } from '../Common'

export function BadgedValueDisplay (props) {

  const [copied, setCopied] = useState(false)

  function renderKeyValuePair (key, value, keyValueId, color = 'red') {
    return (
      <List.Item key={keyValueId} style={{ marginTop: 5 }}>
        <Label color={color} horizontal>
          <div className="tooltip">
            { copied === key &&
               < span className="tooltiptext">Copied</span>
            }
            <Icon data-tip data-for="registerTip"
                  name='copy outline'
                  style={{ cursor: 'pointer', marginRight: '1em' }}
                  onClick={() => {
                    navigator.clipboard.writeText(value)
                    setCopied(key)
                    setTimeout(() => setCopied(null), 400)
                  }}
            >
            </Icon>
          </div>
          {key}
        </Label>

        {Array.isArray(value) ? renderValuesAsBadges(key, value) : <Label>{value.toString().trim()}</Label>}
      </List.Item>
    )
  }

  function renderKeyValues (obj, groupId, color) {
    let items = []
    let i = 0
    for (let [key, value] of Object.entries(obj)) {
      if (value) {
        if (Array.isArray(value) && value.length > 0) {
          items.push(renderKeyValuePair(key, value, `${groupId}-${i}`, color))
        } else {
          let stringified = value.toString().trim()
          if (stringified) {
            items.push(renderKeyValuePair(key, value, `${groupId}-${i}`, color))
          } else {
            continue
          }
        }
        i++
      }
    }
    return items
  }

  return <div>
    {renderKeyValues(props.obj, props.groupId, props.color)}
  </div>
}

