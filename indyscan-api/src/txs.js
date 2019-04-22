const fetch = require('isomorphic-unfetch')
const queryString = require('query-string')

async function getTxs (baseUrl, network, ledger, fromRecentTx, toRecentTx, filterTxNames = []) {
  const query = queryString.stringify({ fromRecentTx, toRecentTx, network, ledger, filterTxNames: JSON.stringify(filterTxNames) })
  let res = await fetch(`${baseUrl}/api/txs?${query}`)
  return res.json()
}

async function getTx (baseUrl, network, ledger, seqNo) {
  const query = queryString.stringify({ network, ledger })
  let res = await fetch(`${baseUrl}/api/txs/${seqNo}?${query}`)
  return res.json()
}

module.exports.getTransactions = getTxs
module.exports.getTx = getTx
