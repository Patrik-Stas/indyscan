const logger = require('../logging/logger-main')
const {interfaces, implIterator} = require('../factory')

function createIteratorGuided ({id, source, sourceSeqNoGuidance}) {

  /*
  - Returns next transaction if available
  - Return undefined if no next transaction currently available
  - Throw if an error occurs
   */
  async function getNextTx(subledger, format = 'original') {
    logger.debug(`${id} requested nextTx from subledger '${subledger}' in format '${format}'.`)
    const seqNo = await sourceSeqNoGuidance.getHighestSeqno(subledger) + 1
    let tx = source.getTxData (subledger, seqNo, format)
    return {
      meta: {
        subledger,
        seqNo,
        format
      },
      tx
    }
  }

  async function getInterfaceName() {
    return interfaces.iterator
  }

  async function getImplName() {
    return implIterator.guided
  }

  return {
    getNextTx,
    getInterfaceName,
    getImplName
  }
}

module.exports.createIteratorGuided = createIteratorGuided