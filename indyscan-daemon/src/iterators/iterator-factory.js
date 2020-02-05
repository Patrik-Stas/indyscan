const logger = require('../logging/logger-main')
const {createIteratorGuided} = require('./iterator-guided')

const INTERFACE = 'ITERATOR'

const IMPLEMENTATIONS = {
  guided: 'guided'
}

function buildSourceFactory () {
  async function buildImplementation (sourceConfig) {
    logger.debug(`Creating iterator from config: ${JSON.stringify(sourceConfig)}`)
    const {impl, data} = sourceConfig
    if (impl === IMPLEMENTATIONS.guided) {
      return createIteratorGuided(data)
    } else {
      throw Error(`Unknown iterator implementation: ${impl}. Supported: ${JSON.stringify(Object.values(IMPLEMENTATIONS))}`)
    }
  }

  function getInterface () {
    return INTERFACE
  }

  return {
    buildImplementation,
    getInterface
  }
}

module.exports.buildSourceFactory = buildSourceFactory
