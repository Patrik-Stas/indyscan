const logger = require('../logging/logger-main')
const {createTargetElasticsearch} = require('./target-elasticsearch')

const INTERFACE = "TARGET"

const IMPLEMENTATIONS = {
  elasticsearch: "elasticsearch"
}

function buildTargetFactory() {
  async function buildImplementation (sourceConfig) {
    logger.debug(`Creating source from config: ${JSON.stringify(sourceConfig)}`)
    const {impl, params} = sourceConfig
    if (impl === IMPLEMENTATIONS.elasticsearch) {
      return createTargetElasticsearch(params)
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

module.exports.buildTargetFactory = buildTargetFactory
