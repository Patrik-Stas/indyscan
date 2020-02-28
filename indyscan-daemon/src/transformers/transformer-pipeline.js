// TODO: Test thiss
function createTransformerPipeline ({ id, transformers }) {

  const lastTransformer = transformers[transformers.length -1]

  async function processTx (txData, format) {
    if (!tx) {
      throw Error('tx argument not defined')
    }

    let txDataProcessed = txData
    let txDataProcessedFormat = format
    for (const transformer of transformers) {
      try {
        let result = await transformer.processTx(txDataProcessed)
        txDataProcessed = result.processedTx
        txDataProcessedFormat = result.format
      } catch (e) {
        throw Error(`${id} Stopping pipeline as cycle '${requestCycleCount}' critically failed to transform tx `
          + `${JSON.stringify(txMeta)} using transformer ${transformer.getObjectId()}. Details: ${e.message} ${e.stack}`)
      }

      if (!txDataProcessed) {
        throw Error(`${id} Stopping pipeline on critical error. Transformer ${transformer.getObjectId()} did `
          + `not return any data. Input transaction ${JSON.stringify(txMeta)}: ${JSON.stringify(txData)}`)
      }
      if (!txDataProcessedFormat) {
        throw Error(`${id} Stopping pipeline on critical error. Transformer  ${transformer.getObjectId()} `
          + `did format of its output txData.`)
      }
    }

    return { processedTx, format }
  }

  function getOutputFormat () {
    return lastTransformer.getOutputFormat()
  }

  async function initializeTarget (target) {
    return lastTransformer.initializeTarget(target)
  }

  function getObjectId () {
    return id
  }

  return {
    processTx,
    initializeTarget,
    getObjectId,
    getOutputFormat
  }
}

module.exports.createTransformerPipeline = createTransformerPipeline


