const logger = require('../logging/logger-main')

function createIteratorGuided ({ id, source, sourceSeqNoGuidance }) {
  /*
  - Returns next transaction if available
  - Return undefined if no next transaction currently available
  - Throw if an error occurs
   */
  async function getNextTx (subledger, format = 'original') {
    logger.debug(`${id} requested nextTx from subledger '${subledger}' in format '${format}'.`)
    const seqNo = await sourceSeqNoGuidance.getHighestSeqno(subledger) + 1
    let tx = source.getTxData(subledger, seqNo, format)
    return {
      meta: {
        subledger,
        seqNo,
        format
      },
      tx
    }
  }

  function getObjectId () {
    return id
  }

  return {
    getNextTx,
    getObjectId
  }
}

module.exports.createIteratorGuided = createIteratorGuided
