const logger = require('../logging/logger-main')
const { intializeEsTarget } = require('./target-inits')

function createTransformerOriginal2Serialized ({ indyNetworkId, operationType, componentId }) {
  const loggerMetadata = {
    metadaemon: {
      indyNetworkId,
      operationType,
      componentId,
      componentType: 'transformer-original2serialized'
    }
  }

  async function processTx (tx) {
    if (!tx) {
      throw Error('tx argument not defined')
    }
    const processedTx = { json: JSON.stringify(tx) }
    return { processedTx, format: getOutputFormat() }
  }

  function getOutputFormat () {
    return 'serialized'
  }

  function getInputFormat () {
    return 'original'
  }

  function getElasticsearchTargetMappings () {
    return {
      json: { type: 'text', index: false }
    }
  }

  async function initializeTarget (target) {
    logger.info('Initializing target.', loggerMetadata)
    return intializeEsTarget(target, getOutputFormat(), getElasticsearchTargetMappings())
  }

  function getObjectId () {
    return componentId
  }

  function describe () {
    return `${getInputFormat()} -> ${getOutputFormat()}`
  }

  return {
    processTx,
    initializeTarget,
    getObjectId,
    getOutputFormat,
    getInputFormat,
    describe
  }
}

module.exports.createTransformerOriginal2Serialized = createTransformerOriginal2Serialized
