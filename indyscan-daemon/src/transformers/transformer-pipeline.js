const logger = require('../logging/logger-main')

function createTransformerPipeline ({ operationId, componentId, transformers }) {
  const lastTransformer = transformers[transformers.length - 1]

  const loggerMetadata = {
    metadaemon: {
      componentType: 'transformer-pipeline',
      componentId,
      operationId
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
      throw Error(`${componentId} proclaims it returns format ${getOutputFormat()} but it actually tried to return format ${tmpProcessedTxFormat}.`)
    }
    const processedTx = tmpProcessedTx
    const format = tmpProcessedTxFormat
    return { processedTx, format }
  }

  function getOutputFormat () {
    return lastTransformer.getOutputFormat()
  }

  async function initializeTarget (target) {
    logger.info(`Initializing target.`, loggerMetadata)
    return lastTransformer.initializeTarget(target)
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

module.exports.createTransformerPipeline = createTransformerPipeline
