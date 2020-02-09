const logger = require('./logging/logger-main')

function createGeneralFactory (objectFactories) {
  function validateObjectConfig (config) {
    if (!config) {
      throw Error(`Config was null or undefined`)
    }
    if (!config.interface) {
      throw Error(`Config is missing interface specification: ${JSON.stringify(config)}`)
    }
    if (!config.params) {
      throw Error(`Config is missing construction data: ${JSON.stringify(config, null, 2)}`)
    }
  }

  function getSupportedInterfaces () {
    return objectFactories.map(factory => factory.getInterface())
  }

  function selectRightFactory (objectConfig) {
    let objectConfigInterface = objectConfig.interface.toUpperCase()
    for (let factory of objectFactories) {
      if (factory.getInterface().toUpperCase() === objectConfigInterface) {
        return factory
      }
    }
    const knownInterfaces = getSupportedInterfaces()
    throw Error(`Could not find factory to build interface ${objectConfigInterface}. ` +
      `Known interface are ${JSON.stringify(knownInterfaces)}. ` +
      `The object config: ${JSON.stringify(sourceConfig)}`
    )
  }

  async function buildImplementation (objectConfig) {
    validateObjectConfig(objectConfig)
    const factory = selectRightFactory(objectConfig)
    const object = await factory.buildImplementation(objectConfig)
    logger.debug(`Successfully built object ${object.getObjectId()}`)
    return object
  }

  return {
    buildImplementation
  }
}

module.exports.createGeneralFactory = createGeneralFactory
