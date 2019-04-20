const INDY_NETWORKS = process.env.INDY_NETWORKS
console.log(`INDYSCAN WEBAPP: Indy networks pass via env variable: ${INDY_NETWORKS}`)
const indyNetworks = INDY_NETWORKS.split(',')

module.exports.getIndyNetworks = function getIndyNetworks () {
  return indyNetworks
}

module.exports.getDefaultNetwork = function getDefaultNetwork () {
  return indyNetworks[0]
}
