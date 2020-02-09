const logger = require('../logging/logger-main')
const {createPipelineSequential} = require('./pipeline-sequential')

const INTERFACE = "PIPELINE"

const IMPLEMENTATIONS = {
  sequential: "sequential"
}

function buildPipelineFactory() {
  async function buildImplementation (sourceConfig) {
    logger.debug(`Creating source from config: ${JSON.stringify(sourceConfig)}`)
    const {impl, params} = sourceConfig
    if ( impl === IMPLEMENTATIONS.sequential) {
      return createPipelineSequential(params)
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

module.exports.buildPipelineFactory = buildPipelineFactory
