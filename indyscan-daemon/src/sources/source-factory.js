const logger = require('../logging/logger-main')
const {createSourceElasticsearch} = require('./source-elasticsearch')

const INTERFACE = "SOURCE"

const IMPLEMENTATIONS = {
  ledger: "ledger",
  elasticsearch: "elasticsearch",
  inmem: "inmem"
}

function buildSourceFactory() {
  async function buildImplementation (sourceConfig) {
    logger.debug(`Creating source from config: ${JSON.stringify(sourceConfig)}`)
    const {impl, data} = sourceConfig
    if (impl === IMPLEMENTATIONS.ledger) {
      return createSourceLedger(data)
    } else if (impl === IMPLEMENTATIONS.elasticsearch) {
      return createSourceElasticsearch(data)
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
