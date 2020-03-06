const logger = require('../logging/logger-main')
const { intializeEsTarget } = require('./target-inits')

function createTransformerSerialized2Original ({ operationId, componentId }) {
  const loggerMetadata = {
    metadaemon: {
      componentType: 'transformer-serialized2original',
      operationId,
      componentId
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

  function getElasticsearchTargetMappings () {
    throw Error(`Output is not intended to be sent to ES.`)
  }

  async function initializeTarget (target) {
    logger.info(`Initializing target.`, loggerMetadata)
    return intializeEsTarget(target, getOutputFormat(), getElasticsearchTargetMappings())
  }

  function getObjectId () {
    return componentId
  }

  return {
    processTx,
    initializeTarget,
    getObjectId,
    getOutputFormat
  }
}

module.exports.createTransformerSerialized2Original = createTransformerSerialized2Original
