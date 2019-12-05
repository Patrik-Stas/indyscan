const { asyncHandler } = require('../middleware')

function initNetworksApi (app, networkManager) {
  app.get('/networks',
    asyncHandler(async function (req, res) {
      const networks = networkManager.getNetworkConfigs()
      const defaultNetwork = networkManager.getNetworkConfig(networkManager.getDefaultNetworkId())
      res.status(200).send({ networks, defaultNetwork })
    }))

  app.get('/networks/:id',
    asyncHandler(async function (req, res) {
      const networkId = req.params.id
      const network = networkManager.getNetworkConfig(networkId)
      if (network) {
        res.status(200).send(network)
      } else {
        res.status(404).send({ message: `Network id=${networkId} not found.` })
      }
    }))
}

module.exports = initNetworksApi
