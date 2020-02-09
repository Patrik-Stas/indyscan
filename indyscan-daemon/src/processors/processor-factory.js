const logger = require('../logging/logger-main')

const INTERFACE = "PROCESSOR"

const IMPLEMENTATIONS = {
  expansion: "expansion",
  noop: "noop"
}

function buildProcessorFactory() {
  async function buildImplementation (sourceConfig) {
    logger.debug(`Creating source from config: ${JSON.stringify(sourceConfig)}`)
    const {impl, params} = sourceConfig
    if (impl === IMPLEMENTATIONS.expansion) {
      return createProcessorExpansion(params)
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

module.exports.buildProcessorFactory = buildProcessorFactory
