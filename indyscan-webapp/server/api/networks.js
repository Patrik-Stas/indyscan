function initNetworksApi (router, networkManager) {
  router.get('/networks', async (req, res) => {
    const networks = networkManager.getNetworkDetails()
    const defaultNetwork = networkManager.getDefaultNetworkId()
    res.status(200).send({ networks, defaultNetwork })
  })

  router.get('/networks/:id', async (req, res) => {
    const id = req.params.id
    const network = networkManager.getNetworkDetails().find(n => n.id === id)
    if (network) {
      res.status(200).send(network)
    } else {
      res.status(404).send({ message: `Network id=${id} not found.` })
    }
  })
}

module.exports = initNetworksApi
