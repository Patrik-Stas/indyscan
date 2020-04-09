import React from 'react'
import './TxChart.scss'
import { Line } from 'react-chartjs-2'
import _ from 'lodash'
import format from 'date-format'

function createChartsDataset (timeSeries, label, borderColor) {
  const zippedTimeseries = _.zip.apply(_, timeSeries)
  const dates = zippedTimeseries[0].map(t => format('yyyy.MM.dd', new Date(t)))
  const txCnt = zippedTimeseries[1]
  return {
    labels: dates,
    dataset: {
      data: txCnt,
      label,
      borderColor,
      fill: false
    }
  }
}

const TxsChart = ({ timeseries, label, type, color }) => {
  if (timeseries.length === 0) {
    return <div/>
  }
  const { labels, dataset } = createChartsDataset(timeseries, label, color)
  const plotData = {
    labels: labels,
    datasets: [dataset]
  }
  return (
    <Line id={`${type}-txchart`} data={plotData}/>
  )
}

export default TxsChart
