const globalLogger = require('../logging/logger-main')

function createIteratorGuided ({ indyNetworkId, source, sourceSeqNoGuidance, guidanceFormat }) {
  const loggerMetadata = {
    metadaemon: {
      indyNetworkId,
      componentType: 'iterator-guided'
    }
  }
  /*
  - Returns next transaction if available
  - Return undefined if no next transaction currently available
  - Throw if an error occurs
   */
  async function getNextTx (subledger, format, logger = globalLogger) {
    logger.debug(`requested nextTx from subledger '${subledger}' in format '${format}'.`, loggerMetadata)
    const seqNo = await sourceSeqNoGuidance.getHighestSeqno(subledger, guidanceFormat) + 1
    logger.debug(`The seqNo ${seqNo} is to be queried from subledger '${subledger}' in format '${format}'.`, loggerMetadata)
    const tx = await source.getTxData(subledger, seqNo, format)
    if (tx) {
      logger.debug(`Iterator resolved next tx: ${JSON.stringify(tx)}`, loggerMetadata)
      return {
        meta: {
          subledger,
          seqNo,
          format
        },
        tx
      }
    }
    logger.debug('Iterator exhausted.', loggerMetadata)
    return undefined
  }

  function describe () {
    return `Guided iterator on source "${source.describe()}" [format:${guidanceFormat}]`
  }

  function getSource() {
    return source
  }

  function getIteratorInfo() {
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
