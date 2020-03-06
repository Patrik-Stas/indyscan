const logger = require('../logging/logger-main')

function createTransformerPipeline ({ operationId, componentId, transformers }) {
  const lastTransformer = transformers[transformers.length -1]

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

    let processedTx = txData
    let txDataProcessedFormat = undefined
    for (const transformer of transformers) {
      try {
        let result = await transformer.processTx(processedTx)
        processedTx = result.processedTx
        txDataProcessedFormat = result.format
      } catch (e) {
        throw Error(`${componentId} Stopping pipeline as cycle '${requestCycleCount}' critically failed to transform tx `
          + `${JSON.stringify(txMeta)} using transformer ${transformer.getObjectId()}. Details: ${e.message} ${e.stack}`)
      }

      if (!processedTx) {
        throw Error(`${componentId} Stopping pipeline on critical error. Transformer ${transformer.getObjectId()} did `
          + `not return any data. Input transaction ${JSON.stringify(txMeta)}: ${JSON.stringify(txData)}`)
      }
      if (!txDataProcessedFormat) {
        throw Error(`${componentId} Stopping pipeline on critical error. Transformer ${transformer.getObjectId()} `
          + `did format of its output txData.`)
      }
    }

    if (txDataProcessedFormat !== getOutputFormat()) {
      throw Error(`${componentId} proclaims it returns format ${getOutputFormat()} but it actually tried to return format ${txDataProcessedFormat}.`)
    }
    return { processedTx, format: txDataProcessedFormat }
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


