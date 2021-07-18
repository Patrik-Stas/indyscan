const axios = require('axios')
const qs = require('query-string')

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

async function getTxCount (baseUrl, network, ledger, filterTxNames = [], search) {
  const query = qs.stringify({ search, filterTxNames: JSON.stringify(filterTxNames) })
  const res = await getRequest(`${baseUrl}/api/networks/${network}/ledgers/${ledger}/txs/stats/count?${query}`)
  return res.txCount
}

async function getTxs (baseUrl, network, ledger, skip, size, filterTxNames = [], format = 'serialized', search, sortFromRecent) {
  const query = qs.stringify({ sortFromRecent, skip, size, format, filterTxNames: JSON.stringify(filterTxNames), search })
  return getRequest(`${baseUrl}/api/networks/${network}/ledgers/${ledger}/txs?${query}`)
}

async function getTxsV2 (baseUrl, network, ledger, skip, size, filterTxNames = [], seqNoGte, seqNoLt, format = 'serialized', search, sortFromRecent) {
  const query = qs.stringify({ sortFromRecent, skip, size, format, filterTxNames: JSON.stringify(filterTxNames), seqNoGte, seqNoLt, search })
  return getRequest(`${baseUrl}/api/networks/${network}/ledgers/${ledger}/txs?${query}`)
}

async function getTx (baseUrl, network, ledger, seqNo, format = 'serialized') {
  const query = qs.stringify({ format })
  const axiosCall = async () => {
    return getRequest(`${baseUrl}/api/networks/${network}/ledgers/${ledger}/txs/${seqNo}?${query}`)
  }
  return returnNullFor404(axiosCall)
}

module.exports.getNetworks = getNetworks
module.exports.getNetwork = getNetwork
module.exports.getDefaultNetwork = getDefaultNetwork
module.exports.getTx = getTx
module.exports.getTxsV2 = getTxsV2
module.exports.getTxs = getTxs
module.exports.getTxCount = getTxCount
