const _ = require('lodash')
const globalLogger = require('../logging/logger-main')
const { buildDidStateTransforms } = require('./state/domain/state-did')

function createTransformerExpansion2State ({ indyNetworkId, sourceLookups }) {
  const loggerMetadata = {
    metadaemon: {
      indyNetworkId,
      componentType: 'transformer-expansion2state'
    }
  }

  function getOutputFormat () {
    return 'state'
  }

  function getInputFormat () {
    return 'expansion'
  }

  const getPreviousStateModification = async (did) => {
    return sourceLookups.getLatestStateForDid(did)
  }

  const { transformAttribToState, transformNymToState } = buildDidStateTransforms(getPreviousStateModification)

  const txTransforms = {
    NYM: transformNymToState,
    ATTRIB: transformAttribToState,
  }

  async function processTx (tx) {
    if (!tx) {
      throw Error('tx argument not defined')
    }
    const txnTypeName = txn.txn.typeName
    if (!txnTypeName) {
      throw Error(`Provided expansion tx was malformed. It did not contain txn.txn.typeName was not specified. Tx: ${JSON.stringify(tx)}`)
    }
    const transform = txTransforms[txnTypeName]
    return (transform) ?  await transform(tx) : {}
  }

  function getEsDomainMappingFields () {
    return {
      // TX: NYM, ATTRIB
      'txn.data.createdByDid': { type: 'keyword' },
      'txn.data.did': { type: 'keyword' },
      'txn.data.verkey': { type: 'keyword' },
      'txn.data.alias': { type: 'keyword' },
      'txn.data.endpoint': { type: 'keyword' },
      'txn.data.updateTime': { type: 'date', format: 'date_time' },
      'txn.data.updateType': { type: 'keyword' }
    }
  }

  function getElasticsearchMappingDirectives () {
    return {
      ...getEsDomainMappingFields(),
    }
  }

  async function initializeTarget (target, logger = globalLogger) {
    logger.info('Initializing target.', loggerMetadata)
    return target.setMappings(getOutputFormat(), getElasticsearchMappingDirectives(), logger)
  }

  function describe () {
    return `${getInputFormat()} -> ${getOutputFormat()}`
  }

  return {
    processTx,
    initializeTarget,
    getOutputFormat,
    getInputFormat,
    describe
  }
}

module.exports.createTransformerExpansion2State = createTransformerExpansion2State
