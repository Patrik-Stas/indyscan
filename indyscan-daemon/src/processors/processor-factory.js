const logger = require('../logging/logger-main')

const INTERFACE = "PROCESSOR"

const IMPLEMENTATIONS = {
  expansion: "expansion"
}

function buildSourceFactory() {
  async function buildImplementation (sourceConfig) {
    logger.debug(`Creating source from config: ${JSON.stringify(sourceConfig)}`)
    const {impl, data} = sourceConfig
    if (impl === IMPLEMENTATIONS.expansion) {
      return createProcessorExpansion(data)
    } else {
      throw Error(`Unknown ${INTERFACE} implementation: ${impl}. Supported: ${JSON.stringify(Object.values(IMPLEMENTATIONS))}`)
    }
  }

  function getInterface() {
    return INTERFACE
  }

  return {
    buildImplementation,
    getInterface
  }
}

module.exports.buildSourceFactory = buildSourceFactory
