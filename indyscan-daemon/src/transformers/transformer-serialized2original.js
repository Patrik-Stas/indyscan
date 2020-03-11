const logger = require('../logging/logger-main')
const { intializeEsTarget } = require('./target-inits')

function createTransformerSerialized2Original ({ indyNetworkId, operationId, componentId }) {
  const loggerMetadata = {
    metadaemon: {
      indyNetworkId,
      operationId,
      componentId,
      componentType: 'transformer-serialized2original'
    }
  }

  async function processTx (tx) {
    if (!tx) {
      throw Error('tx argument not defined')
    }
    if (!tx.json) {
      throw Error(`Expected to find field 'serialized' on provided transaction. Tx: ${JSON.stringify(tx)}`)
    }
    const deserialized = JSON.parse(tx.json)
    return { processedTx: deserialized, format: getOutputFormat() }
  }

  function getOutputFormat () {
    return 'original'
  }

  function getInputFormat () {
    return 'serialized'
  }

  function getElasticsearchTargetMappings () {
    throw Error('Output is not intended to be sent to ES.')
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

module.exports.createTransformerSerialized2Original = createTransformerSerialized2Original
