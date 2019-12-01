import _ from 'lodash'
import React from 'react'
import { Dropdown } from 'semantic-ui-react'

const daySeconds = 3600 * 24
const monthSeconds = daySeconds * 28

const intervals = [
  { label: 'All time', value: Infinity },
  { label: '6 months', value: monthSeconds * 6 },
  { label: '3 months', value: monthSeconds * 3 },
  { label: '1 month', value: monthSeconds },
  { label: '1 week', value: daySeconds * 7 },
  { label: '2 days', value: daySeconds * 2 },
  { label: '24 hours', value: daySeconds }
]
const durationOptions = _.map(intervals, (interval) => ({
  key: interval.value,
  text: interval.label,
  value: interval.value
}))

const IntervalDropdown = (props) => (
  <Dropdown
    placeholder='Duration'
    value={props.value}
    onChange={(event, data) => { props.changeGraphTimerange(data.value) }}
    search
    selection
    options={durationOptions}
  />
)

export default IntervalDropdown
