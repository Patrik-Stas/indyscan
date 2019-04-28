function initNetworksApi (router, networkManager) {
  router.get('/networks', async (req, res) => {
    console.log(`HIT /networks`)
    const networks = networkManager.getIdsWithDisplayNames()
    const defaultNetwork = networkManager.getDefaultNetworkId()
    res.status(200).send({ networks, defaultNetwork })
  })
}

module.exports = initNetworksApi
