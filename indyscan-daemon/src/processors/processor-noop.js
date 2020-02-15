const {interfaces, implProcessor} = require('../factory')

function createProcessorNoop ({id, format}) {

  async function processTx (tx) {
    if (!tx) {
      throw Error('tx argument not defined')
    }
    let processedTx = Object.assign({}, tx)
    return {processedTx, format}
  }

  // TODO: add elasticsearch mapping inializer
  function getEsOriginalFormatMapping() {
    return {
      "original": { type: 'text', index: false },
    }
  }

  async function getFormatName() {
    return 'original'
  }

  async function getInterfaceName() {
    return interfaces.processor
  }

  async function getImplName() {
    return implProcessor.noop
  }

  return {
    processTx,
    getFormatName,
    getInterfaceName,
    getImplName
  }
}


module.exports.createProcessorNoop = createProcessorNoop
