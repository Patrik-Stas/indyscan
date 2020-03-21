const logger = require('../logging/logger-main')

function createNetworkManager (networkConfigs = []) {
  const configs = []

  for (const networkConfig of networkConfigs) {
    addNetworkConfig(networkConfig)
  }

  function addNetworkConfig (config) {
    logger.info(`Validating network configuration ${JSON.stringify(config)}`)
    if (!config.id) {
      throw Error(`Network config '${JSON.stringify(config)}' must contain 'id'.`)
    }
    if (config.aliases) {
      if (!Array.isArray(config.aliases)) {
        throw Error(`Network config '${JSON.stringify(config)}' is ivanlid. field 'aliases' must be array.`)
      }
    }
    if (!config.es || !config.es.index) {
      throw Error(`Network config '${JSON.stringify(config)}' must contain 'es.index'.`)
    }

    config.aliases = config.aliases || []
    config.ui = config.ui || {}
    config.ui.display = config.ui.display || config.id
    config.ui.priority = config.ui.priority || 1
    config.ui.description = config.ui.description || `Hyperledger Indy network ${config.id}.`
    configs.push(config)
    configs.sort((a, b) => a.ui.priority < b.ui.priority)
  }

  function getNetworkConfig (networkIdOrAlias) {
    for (const network of configs) {
      if (network.id === networkIdOrAlias || (network.aliases && network.aliases.includes(networkIdOrAlias))) {
        return network
      }
    }
    return undefined
  }

  function getNetworkConfigs () {
    return configs
  }

  function getHighestPrirorityNetwork () {
    if (configs.length === 0) {
      throw Error('No networks found.')
    }
    return configs[0]
  }

  return {
    addNetworkConfig,
    getNetworkConfig,
    getNetworkConfigs,
    getHighestPrirorityNetwork
  }
}

module.exports.createNetworkManager = createNetworkManager
