const logger = require('../logging/logger-main')

const INTERFACE = "PIPELINE"

const IMPLEMENTATIONS = {
  sequential: "sequential"
}

function buildSourceFactory() {
  async function buildImplementation (sourceConfig) {
    logger.debug(`Creating source from config: ${JSON.stringify(sourceConfig)}`)
    assertInterface(sourceConfig)
    const {impl, data} = sourceConfig
    if ( impl === IMPLEMENTATIONS.sequential) {
      return createPipelineSequential(data)
    } else {
      throw Error(`Unknown source implementation: ${impl}. Supported: ${JSON.stringify(Object.values(IMPLEMENTATIONS))}`)
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
