// TODO: Test thiss
function createTransformerPipeline ({ id, transformers }) {

  const lastTransformer = transformers[transformers.length -1]

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
        throw Error(`${id} Stopping pipeline as cycle '${requestCycleCount}' critically failed to transform tx `
          + `${JSON.stringify(txMeta)} using transformer ${transformer.getObjectId()}. Details: ${e.message} ${e.stack}`)
      }

      if (!processedTx) {
        throw Error(`${id} Stopping pipeline on critical error. Transformer ${transformer.getObjectId()} did `
          + `not return any data. Input transaction ${JSON.stringify(txMeta)}: ${JSON.stringify(txData)}`)
      }
      if (!txDataProcessedFormat) {
        throw Error(`${id} Stopping pipeline on critical error. Transformer  ${transformer.getObjectId()} `
          + `did format of its output txData.`)
      }
    }

    if (txDataProcessedFormat !== getOutputFormat()) {
      throw Error(`${id} proclaims it returns format ${getOutputFormat()} but it actually tried to return format ${txDataProcessedFormat}.`)
    }
    return { processedTx, format: txDataProcessedFormat }
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


