const {intializeEsTarget} = require('./target-inits')

function createTransformerSerializer ({id}) {
  async function processTx (tx) {
    if (!tx) {
      throw Error('tx argument not defined')
    }
    const processedTx = {serialized: JSON.stringify(tx)}
    return {processedTx, format: getOutputFormat()}
  }

  function getOutputFormat () {
    return 'original'
  }

  function getElasticsearchTargetMappings () {
    return {
      'serialized': {type: 'text', index: false}
    }
  }

  async function initializeTarget (target) {
    return intializeEsTarget(target, getElasticsearchTargetMappings())
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

module.exports.createTransformerSerializer = createTransformerSerializer
