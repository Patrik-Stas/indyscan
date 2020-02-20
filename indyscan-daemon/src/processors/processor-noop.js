const {interfaces, implProcessor} = require('../factory')

function createProcessorNoop ({id, format}) {

  async function processTx (tx) {
    if (!tx) {
      throw Error('tx argument not defined')
    }
    let processedTx = Object.assign({}, tx)
    return {processedTx, format}
  }

  function getElasticsearchTargetMappings () {
    return {
        "serialized": { type: 'text', index: false }
    }
  }

  async function initializeTarget (target) {
    if (target.getImplName() === 'elasticsearch') {
      await intializeEsTarget(target, getElasticsearchTargetMappings())
    } else {
      throw Error(`Processor ${id} doesn't know how to initialize target implementation ${targetImpl}`)
    }
  }

  function getObjectId() {
    return id
  }

  return {
    processTx,
    initializeTarget,
    getObjectId
  }
}


module.exports.createProcessorNoop = createProcessorNoop
