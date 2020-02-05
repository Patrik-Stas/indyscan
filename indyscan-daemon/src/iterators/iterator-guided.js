const logger = require('../logging/logger-main')

function createIteratorGuided ({id, source, sourceSeqNoGuidance}) {

  async function getTx(subledger, format = 'original') {
    logger.debug(`${id} requested nextTx from subledger '${subledger}' in format '${format}'.`)
    const seqNo = await sourceSeqNoGuidance.getHighestSeqno(subledger) + 1
    return source.getTx (subledger, seqNo, format)
  }

  return {
    getTx
  }
}

module.exports.createIteratorGuided = createIteratorGuided
