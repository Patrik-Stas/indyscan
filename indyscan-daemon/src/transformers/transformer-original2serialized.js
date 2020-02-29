const { intializeEsTarget } = require('./target-inits')

function createTransformerOriginal2Serialized ({ id }) {
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

  function getElasticsearchTargetMappings () {
    return {
      'json': { type: 'text', index: false }
    }
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

module.exports.createTransformerOriginal2Serialized = createTransformerOriginal2Serialized
