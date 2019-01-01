import fetch from "isomorphic-unfetch";
import queryString from "query-string";

export async function getTxTimeseries(baseUrl, network, txType) {
    const query = queryString.stringify({network, txType});
    // console.log(`Fetching tx timeseries for network ${network} of tx type ${txType}`);
    let res = await fetch(`${baseUrl}/api/txs-timeseries?${query}`);
    return await res.json();
}

export async function getTransactions(baseUrl, network, txType, fromRecentTx, toRecentTx) {
    const query = queryString.stringify({fromRecentTx, toRecentTx, network, txType});
    // console.log(`Fetching config txs from ${fromRecentTx} to ${toRecentTx}`);
    let res = await fetch(`${baseUrl}/api/txs?${query}`);
    return await res.json();
}