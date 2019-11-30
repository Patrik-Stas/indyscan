const logger = require('../logging/logger-main')

function createNetworkManager () {

  let networkConfigs = {}

  function addNetworkConfig(config) {
    logger.info(`Validating network configuration ${JSON.stringify(config)}`)
    if (!config.id) {
      throw Error(`Network config '${JSON.stringify(config)}' must contain 'id'.`)
    }
    if (!config.display) {
      throw Error(`Network config '${JSON.stringify(config)}' must contain 'display'.`)
    }
    if (!config.es) {
      throw Error(`Network config '${JSON.stringify(config)}' must contain 'es'.`)
    }
    if (!config.es.index) {
      throw Error(`Network config '${JSON.stringify(config)}' must contain 'es'.`)
    }
    if (config.aliases) {
      if (!Array.isArray(config.aliases)) {
        throw Error(`Network config '${JSON.stringify(config)}' has aliases set up, but it must be array.`)
      }
    }
    logger.info(`Validated network configuration ${config.id}`)
    networkConfigs[config.id] = config
  }


  function getNetworkDbs () {
    return networkConfigs.map(network => network.db)
  }

  function getNetworkId (reference) {
    for (const network of Object.values(networkConfigs)) {
      if (network.id === reference) {
        return network.id
      }
      if (network.aliases && network.aliases.includes(reference)) {
        return network.id
      }
    }
    return undefined
  }

  function getDefaultNetworkId () {
    if (Object.keys(networkConfigs).length > 1) {
      return Object.values(networkConfigs).find(config => config.isDefault === true).id
    } else if (Object.keys(networkConfigs).length === 1) {
      return Object.values(networkConfigs)[0].id
    } else {
      return undefined
    }
  }

  function getNetworkConfigs () {
    return Object.values(networkConfigs)
  }

  function getNetworkConfig(networkId) {
    return networkConfigs[networkId]
  }

  return {
    addNetworkConfig,
    getNetworkDbs,
    getNetworkId,
    getDefaultNetworkId,
    getNetworkConfig,
    getNetworkConfigs
  }
}

module.exports.createNetworkManager = createNetworkManager
