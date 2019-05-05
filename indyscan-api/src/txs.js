const fetch = require('isomorphic-unfetch')
const queryString = require('query-string')

async function getTxCount (baseUrl, network, ledger, filterTxNames = []) {
  const query = queryString.stringify({ filterTxNames: JSON.stringify(filterTxNames) })
  let res = await fetch(`${baseUrl}/api/networks/${network}/ledgers/${ledger}/txs/count${query}`)
  return (await res.json()).txCount
}

async function getTxTimeseries (baseUrl, network, ledger) {
  let res = await fetch(`${baseUrl}/api/networks/${network}/ledgers/${ledger}/txs/series`)
  return res.json()
}

async function getTxs (baseUrl, network, ledger, fromRecentTx, toRecentTx, filterTxNames = []) {
  const query = queryString.stringify({ fromRecentTx, toRecentTx, filterTxNames: JSON.stringify(filterTxNames) })
  let res = await fetch(`${baseUrl}/api/networks/${network}/ledgers/${ledger}/txs?${query}`)
  return res.json()
}

async function getTx (baseUrl, network, ledger, seqNo) {
  let res = await fetch(`${baseUrl}/api/networks/${network}/ledgers/${ledger}/txs/${seqNo}`)
  return res.json()
}

module.exports.getTransactions = getTxs
module.exports.getTx = getTx
module.exports.getTxTimeseries = getTxTimeseries
module.exports.getTxCount = getTxCount
