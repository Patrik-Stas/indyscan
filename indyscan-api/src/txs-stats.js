const fetch = require('isomorphic-unfetch')
const queryString = require('query-string')

async function getTxCount (baseUrl, network, txType, filterTxNames = []) {
  const query = queryString.stringify({ network, txType, filterTxNames: JSON.stringify(filterTxNames) })
  let res = await fetch(`${baseUrl}/api/txs/stats/count?${query}`)
  return (await res.json()).txCount
}

async function getTxTimeseries (baseUrl, network, txType) {
  const query = queryString.stringify({ network, txType })
  let res = await fetch(`${baseUrl}/api/txs/stats/series?${query}`)
  return res.json()
}

module.exports.getTxTimeseries = getTxTimeseries
module.exports.getTxCount = getTxCount
