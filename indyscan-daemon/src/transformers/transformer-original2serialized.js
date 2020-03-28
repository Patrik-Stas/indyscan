const globalLogger = require('../logging/logger-main')

function createTransformerOriginal2Serialized ({ indyNetworkId, operationType }) {
  const loggerMetadata = {
    metadaemon: {
      indyNetworkId,
      operationType,
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

  async function initializeTarget (target, logger = globalLogger) {
    logger.info('Initializing target.', loggerMetadata)
    return target.setMappings(getOutputFormat(), getElasticsearchTargetMappings(), logger)
  }

  function describe () {
    return `${getInputFormat()} -> ${getOutputFormat()}`
  }

  return {
    processTx,
    initializeTarget,
    getOutputFormat,
    getInputFormat,
    describe
  }
}

module.exports.createTransformerOriginal2Serialized = createTransformerOriginal2Serialized
