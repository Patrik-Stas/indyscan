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
    logger.info(`The seqNo ${seqNo} is to be queried from subledger '${subledger}' in format '${format}'. `)
    let tx = await source.getTxData(subledger, seqNo, format)
    logger.info(`Iterator resolved next tx: ${JSON.stringify(tx)}`)
    if (tx) {
      return {
        meta: {
          subledger,
          seqNo,
          format
        },
        tx
      }
    }
    return undefined
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
