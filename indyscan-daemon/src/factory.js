const logger = require('./logging/logger-main')
const { createWorkerRtw } = require('./workers/worker-rtw')
const { createIteratorGuided } = require('./iterators/iterator-guided')
const { createTransformerSerializer } = require('./transformers/transformer-serializer')
const { createTransformerExpansion } = require('./transformers/transformer-expansion')
const { createTargetMemory } = require('./targets/target-memory')
const { createTargetElasticsearch } = require('./targets/target-elasticsearch')
const { createSourceMemory } = require('./sources/source-memory')
const { createSourceElasticsearch } = require('./sources/source-elasticsearch')
const { createSourceLedger } = require('./sources/source-ledger')

const interfaces = {
  'source': 'source',
  'target': 'target',
  'transformer': 'transformer',
  'iterator': 'iterator',
  'worker': 'worker'
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

const implTransformer = {
  'expansion': 'expansion',
  'serializer': 'serializer'
}

const implPipeline = {
  'sequential': 'sequential'
}

async function _buildImplementation (interfaceName, implementationName, objectConfig) {
  switch (interfaceName) {
    case interfaces.source:
      switch (implementationName) {
        case implSource.elasticsearch:
          return createSourceElasticsearch(objectConfig)
        case implSource.memory:
          return createSourceMemory(objectConfig)
        case implSource.ledger:
          return createSourceLedger(objectConfig)
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
    case interfaces.transformer:
      switch (implementationName) {
        case implTransformer.expansion:
          return createTransformerExpansion(objectConfig)
        case implTransformer.serializer:
          return createTransformerSerializer(objectConfig)
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
    case interfaces.worker:
      switch (implementationName) {
        case implPipeline.sequential:
          return createWorkerRtw(objectConfig)
        default:
          throw Error(`Unknown ${interfaceName} implementation ${implementationName}`)
      }
    default:
      throw Error(`Unknown interface ${interfaceName}.`)
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
  const interfaceName = objectConfig.interface.toLowerCase()
  const implementationName = objectConfig.impl.toLowerCase()
  let object
  try {
    object = await _buildImplementation(interfaceName, implementationName, objectConfig.params)
  } catch (e) {
    throw Error(`Failed to build implementation from config ${JSON.stringify(objectConfig, null, 2)} \n because: ${e.message}\n${e.stack}`)
  }
  logger.info(`Successfully built interface '${interfaceName}' implementation '${implementationName}'.`)
  return object
}

module.exports.buildImplementation = buildImplementation
module.exports.interfaces = interfaces
module.exports.implPipeline = implPipeline
module.exports.implIterator = implIterator
module.exports.implTransformer = implTransformer
module.exports.implTarget = implTarget
module.exports.implSource = implSource
