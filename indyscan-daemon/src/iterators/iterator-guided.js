const logger = require('../logging/logger-main')

function createIteratorGuided ({ id, source, sourceSeqNoGuidance, guidanceFormat }) {
  /*
  - Returns next transaction if available
  - Return undefined if no next transaction currently available
  - Throw if an error occurs
   */
  async function getNextTx (subledger, format) {
    logger.debug(`${id} requested nextTx from subledger '${subledger}' in format '${format}'.`)
    const seqNo = await sourceSeqNoGuidance.getHighestSeqno(subledger, guidanceFormat) + 1
    let tx = await source.getTxData(subledger, seqNo, format)
    if (tx) {
      return {
        meta: {
          subledger,
          seqNo,
          format
        },
        tx
      }
    } else {
      return {
        meta: {
          subledger,
          seqNo,
          format
        }
      }
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
