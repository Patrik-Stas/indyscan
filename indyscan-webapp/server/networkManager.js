function createNetworkManager (networkConfigs) {
  console.log(`Creating network manager instance using config:\n${JSON.stringify(networkConfigs, null, 2)}`)
  if (networkConfigs.length < 1) {
    throw Error('At least 1 network configuration si required.')
  }
  for (const config of networkConfigs) {
    if (!config.id) {
      throw Error(`Network config '${JSON.stringify(config)}' must contain 'id'.`)
    }
    if (!config.display) {
      throw Error(`Network config '${JSON.stringify(config)}' must contain 'display'.`)
    }
    if (!config.db) {
      throw Error(`Network config '${JSON.stringify(config)}' must contain 'db'.`)
    }
    if (config.aliases) {
      if (!Array.isArray(config.aliases)) {
        throw Error(`Network config '${JSON.stringify(config)}' has aliases set up, but it must be array.`)
      }
    }
  }

  function resolveNetwork (reference) {
    for (const network of networkConfigs) {
      if (network.id === reference) {
        return network
      }
      if (network.aliases && network.aliases.includes(reference)) {
        return network
      }
    }
  }

  function getNetworkDbs () {
    return networkConfigs.map(network => network.db)
  }

  function getDbName (reference) {
    const network = resolveNetwork(reference)
    return network.db
  }

  function getNetworkIds () {
    return networkConfigs.map(network => network.id)
  }

  function getDefaultNetworkId () {
    return networkConfigs[0].id
  }

  function getIdsWithDisplayNames () {
    return networkConfigs.map(config => { return { id: config.id, display: config.display } })
  }

  return {
    getNetworkDbs,
    getDbName,
    getNetworkIds,
    getDefaultNetworkId,
    getIdsWithDisplayNames
  }
}

module.exports.createNetworkManager = createNetworkManager
