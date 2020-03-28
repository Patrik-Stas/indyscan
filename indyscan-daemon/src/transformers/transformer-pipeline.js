const globalLogger = require('../logging/logger-main')

function createTransformerPipeline ({ indyNetworkId, operationType, transformers }) {
  const firstTransformer = transformers[0]
  const lastTransformer = transformers[transformers.length - 1]

  const loggerMetadata = {
    metadaemon: {
      indyNetworkId,
      operationType,
      componentType: 'transformer-pipeline'
    }
  }

  async function processTx (txData) {
    if (!txData) {
      throw Error(`Transaction to process is ${txData}`)
    }
    let tmpProcessedTx = txData
    let tmpProcessedTxFormat
    for (const transformer of transformers) {
      let result
      try {
        result = await transformer.processTx(tmpProcessedTx)
      } catch (e) {
        throw Error(`Transform pipeline failed to finish transformation of ${JSON.stringify(tmpProcessedTx)} ` +
          ` using transformer ${transformer.getObjectId()}. Details: ${e.message} ${e.stack}`)
      }
      if (!result.processedTx) {
        throw Error(`Transformer ${transformer.getObjectId()} did not return any data. Input transaction ${JSON.stringify(tmpProcessedTx)}`)
      }
      if (!result.format) {
        throw Error(`Transformer ${transformer.getObjectId()} did not return output format.`)
      }
      tmpProcessedTx = result.processedTx
      tmpProcessedTxFormat = result.format
    }

    if (tmpProcessedTxFormat !== getOutputFormat()) {
      throw Error(`Transformer declares return format ${getOutputFormat()} but it actually tried to return format ${tmpProcessedTxFormat}.`)
    }
    const processedTx = tmpProcessedTx
    const format = tmpProcessedTxFormat
    return { processedTx, format }
  }

  function getOutputFormat () {
    return lastTransformer.getOutputFormat()
  }

  function getInputFormat () {
    return firstTransformer.getInputFormat()
  }

  function describe () {
    // let description = `${transformers[0].getInputFormat()}`
    // for (const transformer of transformers) {
    //   description += `-> ${transformer.getOutputFormat()}`
    // }
    return `${firstTransformer.getInputFormat()} -> ${lastTransformer.getOutputFormat()}`
  }

  async function initializeTarget (target, logger = globalLogger) {
    logger.info('Initializing target.', loggerMetadata)
    return lastTransformer.initializeTarget(target, logger)
  }

  return {
    processTx,
    initializeTarget,
    getOutputFormat,
    getInputFormat,
    describe
  }
}

module.exports.createTransformerPipeline = createTransformerPipeline
