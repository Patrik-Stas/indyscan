const fetch = require('isomorphic-unfetch')
const queryString = require('query-string')

async function getTxTimeseries (baseUrl, network, txType) {
  const query = queryString.stringify({ network, txType })
  let res = await fetch(`${baseUrl}/api/txs-timeseries?${query}`)
  return res.json()
}

async function getTransactions (baseUrl, network, txType, fromRecentTx, toRecentTx) {
  const query = queryString.stringify({ fromRecentTx, toRecentTx, network, txType })
  let res = await fetch(`${baseUrl}/api/txs?${query}`)
  return res.json()
}

async function getTx (baseUrl, network, txType, seqNo) {
  const query = queryString.stringify({ seqNo, network, txType })
  let res = await fetch(`${baseUrl}/api/tx?${query}`)
  return res.json()
}

async function getTxCount (baseUrl, network, txType) {
  const query = queryString.stringify({ network, txType })
  let res = await fetch(`${baseUrl}/api/txs/count?${query}`)
  return (await res.json()).txCount
}

async function getNetworks (baseUrl) {
  let res = await fetch(`${baseUrl}/api/networks`)
  return (await res.json()).networks
}

async function getDefaultNetwork (baseUrl) {
  let res = await fetch(`${baseUrl}/networks`)
  return (await res.json()).defaultNetwork
}

module.exports.getTxTimeseries = getTxTimeseries
module.exports.getTransactions = getTransactions
module.exports.getTx = getTx
module.exports.getTxCount = getTxCount
module.exports.getNetworks = getNetworks
module.exports.getDefaultNetwork = getDefaultNetwork
