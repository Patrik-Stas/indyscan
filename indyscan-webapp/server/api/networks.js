const logger = require('../logging/logger-main')

function initNetworksApi (router, networkManager) {
  router.get('/networks', async (req, res) => {
    const networks = networkManager.getNetworkConfigs()
    const defaultNetwork = networkManager.getNetworkConfig(networkManager.getDefaultNetworkId())
    res.status(200).send({ networks, defaultNetwork })
  })

  router.get('/networks/:id', async (req, res) => {
    const networkId = req.params.id
    const network = networkManager.getNetworkConfig(networkId)
    if (network) {
      res.status(200).send(network)
    } else {
      res.status(404).send({ message: `Network id=${networkId} not found.` })
    }
  })
}

module.exports = initNetworksApi
