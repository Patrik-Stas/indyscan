const fetch = require('isomorphic-unfetch')

async function getNetworks (baseUrl) {
  let res = await fetch(`${baseUrl}/api/networks`)
  return (await res.json()).networks
}

async function getNetwork (baseUrl, networkId) {
  let res = await fetch(`${baseUrl}/api/networks/${networkId}`)
  return (await res.json())
}

async function getDefaultNetwork (baseUrl) {
  let res = await fetch(`${baseUrl}/networks`)
  return (await res.json()).defaultNetwork
}

module.exports.getNetworks = getNetworks
module.exports.getNetwork = getNetwork
module.exports.getDefaultNetwork = getDefaultNetwork
