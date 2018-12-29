import fetch from "isomorphic-unfetch";

export async function getTimeseriesDomain(baseUrl) {
    let res = await fetch(`${baseUrl}/api/tx-domain/timeseries`);
    return await res.json();
}

export async function getTimeseriesPool(baseUrl) {
    let res = await fetch(`${baseUrl}/api/tx-pool/timeseries`);
    return await res.json();
}

export async function getTimeseriesConfig(baseUrl) {
    let res = await fetch(`${baseUrl}/api/tx-config/timeseries`);
    return await res.json();
}
