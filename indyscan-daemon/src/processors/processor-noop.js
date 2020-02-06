function createProcessorNoop ({id, format}) {

  async function processTx (tx) {
    if (!tx) {
      throw Error('tx argument not defined')
    }
    let processedTx = Object.assign({}, tx)
    return {processedTx, format}
  }

  async function getFormatName() {
    return 'original'
  }

  return {
    processTx,
    getFormatName
  }
}


module.exports.createProcessorNoop = createProcessorNoop
