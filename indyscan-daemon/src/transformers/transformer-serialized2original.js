const { intializeEsTarget } = require('./target-inits')

function createTransformerSerialized2Original ({ id }) {
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
    return intializeEsTarget(target, getOutputFormat(), getElasticsearchTargetMappings())
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

module.exports.createTransformerSerialized2Original = createTransformerSerialized2Original
