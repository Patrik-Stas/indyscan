const globalLogger = require('../logging/logger-main')

function createIteratorGuided ({ indyNetworkId, source, sourceSeqNoGuidance, guidanceFormat }) {
  async function getNextTx (subledger, format, logger = globalLogger) {
    let seqNo
    try {
      seqNo = await sourceSeqNoGuidance.getHighestSeqno(subledger, guidanceFormat) + 1
    } catch (error) {
      return {
        queryMeta: { subledger, format, error },
        queryStatus: 'CANT_DETERMINE_SEQNO_TO_QUERY'
      }
    }
    logger.debug(`Determined next seqNo to query on '${subledger}' in format '${format}' is ${seqNo}.`)
    const queryMeta = { subledger, seqNo, format }
    try {
      const tx = await source.getTxData(subledger, seqNo, format)
      if (!tx) {
        return { queryMeta, queryStatus: 'CURRENTLY_EXHAUSTED' }
      }
      logger.debug(`Iterator resolved next tx: ${JSON.stringify(tx)}`)
      return { queryMeta, tx, queryStatus: 'RESOLUTION_SUCCESS' }
    } catch (error) {
      return { queryMeta, queryStatus: 'RESOLUTION_ERROR', error }
    }
  }

  function describe () {
    return `Guided iterator on source "${source.describe()}" [format:${guidanceFormat}]`
  }

  function getSource () {
    return source
  }

  function getIteratorInfo () {
    return {
      indyNetworkId,
      sourceInfo: source.getSourceInfo(),
      sourceSeqNoGuidanceInfo: sourceSeqNoGuidance.getSourceInfo(),
      guidanceFormat
    }
  }

  return {
    getIteratorInfo,
    getSource,
    getNextTx,
    describe
  }
}

module.exports.createIteratorGuided = createIteratorGuided
