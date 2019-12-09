const axios = require('axios')
const qs = require('query-string')
const util = require('util')

async function getRequest (url) {
  const res = await axios.get(url)
  return res.data
}

async function returnNullFor404 (axiosCallableReturningResponseData) {
  try {
    const data = await axiosCallableReturningResponseData()
    return data
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return null
    } else throw err
  }
}

async function getNetworks (baseUrl) {
  return getRequest(`${baseUrl}/api/networks`)
}

async function getNetwork (baseUrl, networkRef) {
  return getRequest(`${baseUrl}/api/networks/${networkRef}`)
}

async function getDefaultNetwork (baseUrl) {
  const axiosCall = async () => {
    return getRequest(`${baseUrl}/api/default-network`)
  }
  return returnNullFor404(axiosCall)
}

async function getTxCount (baseUrl, network, ledger, filterTxNames = []) {
  const query = qs.stringify({filterTxNames: JSON.stringify(filterTxNames)})
  let res = await getRequest(`${baseUrl}/api/networks/${network}/ledgers/${ledger}/txs/stats/count?${query}`)
  return res.txCount
}

async function getTxs (baseUrl, network, ledger, fromRecentTx, toRecentTx, filterTxNames = [], format = 'original', search) {
  const query = qs.stringify({fromRecentTx, toRecentTx, format, filterTxNames: JSON.stringify(filterTxNames), search})
  return getRequest(`${baseUrl}/api/networks/${network}/ledgers/${ledger}/txs?${query}`)
}

async function getTx (baseUrl, network, ledger, seqNo, format = 'original') {
  const query = qs.stringify({format})
  const axiosCall =   async () => {
    return getRequest(`${baseUrl}/api/networks/${network}/ledgers/${ledger}/txs/${seqNo}?${query}`)
  }
  return returnNullFor404(axiosCall)
}

module.exports.getNetworks = getNetworks
module.exports.getNetwork = getNetwork
module.exports.getDefaultNetwork = getDefaultNetwork
module.exports.getTx = getTx
module.exports.getTxs = getTxs
module.exports.getTxCount = getTxCount
