const { asyncHandler } = require('../middleware')

function initNetworksApi (app, networkManager) {
  app.get('/api/networks',
    asyncHandler(async function (req, res) {
      const networks = networkManager.getNetworkConfigs()
      res.status(200).send(networks)
    }))

  app.get('/api/networks/:id',
    asyncHandler(async function (req, res) {
      const networkId = req.params.id
      const network = networkManager.getNetworkConfig(networkId)
      if (network) {
        res.status(200).send(network)
      } else {
        res.status(404).send({ message: `Network id=${networkId} not found.` })
      }
    }))

  app.get('/api/default-network',
    asyncHandler(async function (req, res) {
      const network = await networkManager.getHighestPrirorityNetwork()
      res.status(200).send(network)
    }))
}

module.exports = initNetworksApi
