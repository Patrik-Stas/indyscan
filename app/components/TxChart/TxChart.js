import React from 'react'
import './TxChart.scss'
import {Line} from "react-chartjs-2";
import _ from 'lodash'
import format from 'date-format';

function createChartsDataset(timeSeries, label, borderColor) {
    const zippedTimeseries = _.zip.apply(_, timeSeries);
    const dates = zippedTimeseries[0].map(t => format('yyyy.MM.dd', new Date(t)));
    const txCnt = zippedTimeseries[1];
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

const TxsChart = (props) => {
    const domain = createChartsDataset(props.timeseriesDomain, "Domain tx count", "#3e95cd");
    const pool = createChartsDataset(props.timeseriesPool, "Pool tx count", "#cd4639");
    const config = createChartsDataset(props.timeseriesConfig, "Config tx count", "#3dcd34");
    const dataDomain = {
        labels: domain.labels,
        datasets: [
            domain.dataset
        ]
    };
    const dataPool = {
        labels: pool.labels,
        datasets: [
            pool.dataset
        ]
    };
    const dataConfig = {
        labels: config.labels,
        datasets: [
            config.dataset
        ]
    };
    return (
        <div>
            <Line id="tx-chart" data={dataDomain}/>
            <Line id="tx-chart" data={dataPool}/>
            <Line id="tx-chart" data={dataConfig}/>
        </div>
    )
};

export default TxsChart