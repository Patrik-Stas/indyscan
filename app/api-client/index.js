import fetch from 'isomorphic-unfetch'
import queryString from 'query-string'

export async function getTxTimeseries (baseUrl, network, txType) {
  const query = queryString.stringify({ network, txType })
  let res = await fetch(`${baseUrl}/api/txs-timeseries?${query}`)
  return await res.json()
}

export async function getTransactions (baseUrl, network, txType, fromRecentTx, toRecentTx) {
  const query = queryString.stringify({ fromRecentTx, toRecentTx, network, txType })
  let res = await fetch(`${baseUrl}/api/txs?${query}`)
  return await res.json()
}

export async function getTx (baseUrl, network, txType, seqNo) {
  const query = queryString.stringify({ seqNo, network, txType })
  let res = await fetch(`${baseUrl}/api/tx?${query}`)
  return await res.json()
}

export async function getTxCount (baseUrl, network, txType) {
  const query = queryString.stringify({ network, txType })
  let res = await fetch(`${baseUrl}/api/txs/count?${query}`)
  return (await res.json()).txCount
}

export async function getNetworks (baseUrl) {
  let res = await fetch(`${baseUrl}/api/networks`)
  return (await res.json()).networks
}

export async function getDefaultNetwork (baseUrl) {
  let res = await fetch(`${baseUrl}/networks`)
  return (await res.json()).defaultNetwork
}
