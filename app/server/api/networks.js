const { getIndyNetworks, getDefaultNetwork } = require('../networks')

function initNetworksApi (router) {
  router.get('/networks', async (req, res) => {
    console.log(`HIT /networks`)
    const networks = getIndyNetworks()
    const defaultNetwork = getDefaultNetwork()
    res.status(200).send({ networks, defaultNetwork })
  })
}

module.exports = initNetworksApi
