const { intializeEsTarget } = require('./target-inits')

function createTransformerSerializer ({ id }) {
  async function processTx (tx) {
    if (!tx) {
      throw Error('tx argument not defined')
    }
    const processedTx = { serialized: JSON.stringify(tx) }
    return { processedTx, format: 'original' }
  }

  function getElasticsearchTargetMappings () {
    return {
      'serialized': { type: 'text', index: false }
    }
  }

  async function initializeTarget (target) {
    const targetImpl = target.getImplName()
    if (targetImpl === 'elasticsearch') {
      await intializeEsTarget(target, getElasticsearchTargetMappings())
    } else {
      throw Error(`Processor ${id} doesn't know how to initialize target implementation ${targetImpl}`)
    }
  }

  function getObjectId () {
    return id
  }

  return {
    processTx,
    initializeTarget,
    getObjectId
  }
}

module.exports.createTransformerSerializer = createTransformerSerializer
