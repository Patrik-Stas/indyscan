const logger = require('./logging/logger-main')

const interfaces = {
  'source': 'source',
  'target': 'target',
  'processor': 'processor',
  'iterator': 'iterator',
  'pipeline': 'pipeline'
}

const implSource = {
  'elasticsearch': 'elasticsearch',
  'memory': 'memory',
  'ledger': 'ledger'
}

const implTarget = {
  'elasticsearch': 'elasticsearch',
  'memory': 'memory'
}

const implIterator = {
  'guided': 'guided'
}

const implProcessor = {
  'expansion': 'expansion',
  'noop': 'noop'
}

const implPipeline = {
  'sequential': 'sequential'
}

function createGeneralFactory () {
  async function
  _buildImplementation (interfaceName, implementationName, objectConfig) {
    switch (interfaceName) {
      case interfaces.source:
        switch (implementationName) {
          case implSource.elasticsearch:
            return createSourceElasticsearch(objectConfig)
          case implSource.memory:
            return createSourceMemory(objectConfig)
          default:
            throw Error(`Unknown ${interfaceName} implementation ${implementationName}`)
        }
      case interfaces.target:
        switch (implementationName) {
          case implTarget.elasticsearch:
            return createTargetElasticsearch(objectConfig)
          case implTarget.memory:
            return createTargetMemory(objectConfig)
          default:
            throw Error(`Unknown ${interfaceName} implementation ${implementationName}`)
        }
      case interfaces.processor:
        switch (implementationName) {
          case implProcessor.expansion:
            return createProcessorExpansion(objectConfig)
          case implProcessor.noop:
            return createProcessorNoop(objectConfig)
          default:
            throw Error(`Unknown ${interfaceName} implementation ${implementationName}`)
        }
      case interfaces.iterator:
        switch (implementationName) {
          case implIterator.guided:
            return createIteratorGuided(objectConfig)
          default:
            throw Error(`Unknown ${interfaceName} implementation ${implementationName}`)
        }
      case interfaces.pipeline:
        switch (implementationName) {
          case implPipeline.sequential:
            return createPipelineSequential(objectConfig)
          default:
            throw Error(`Unknown ${interfaceName} implementation ${implementationName}`)
        }
    }
  }

  function validateObjectConfig (config) {
    if (!config) {
      throw Error(`Config was null or undefined`)
    }
    if (!config.interface) {
      throw Error(`Config is missing interface specification: ${JSON.stringify(config)}`)
    }
    if (!config.impl) {
      throw Error(`Config is missing implementation specification: ${JSON.stringify(config)}`)
    }
    if (!config.params) {
      throw Error(`Config is missing construction parameters: ${JSON.stringify(config, null, 2)}`)
    }
  }

  async function buildImplementation (objectConfig) {
    validateObjectConfig(objectConfig)
    const interfaceName = objectConfig.interface.toUpperCase()
    const implementationName = objectConfig.impl.toUpperCase()
    let object
    try {
      object = await _buildImplementation(interfaceName, implementationName, objectConfig)
    } catch (e) {
      throw Error(`Failed to build implementation from config ${JSON.stringify(objectConfig)} because: ${e.message}\n${e.stack}`)
    }
    logger.info(`Successfully built interface '${interfaceName}' implementation '${implementationName}'.`)
    return object
  }

  return {
    buildImplementation
  }
}

module.exports.createGeneralFactory = createGeneralFactory
module.exports.interfaces = interfaces
module.exports.implPipeline = implPipeline
module.exports.implIterator = implIterator
module.exports.implProcessor = implProcessor
module.exports.implTarget = implTarget
module.exports.implSource = implSource
