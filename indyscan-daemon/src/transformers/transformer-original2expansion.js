const logger = require('../logging/logger-main')
const geoip = require('geoip-lite')
const _ = require('lodash')
const { intializeEsTarget } = require('./target-inits')
const { transformPoolUpgrade } = require('./expansion/config/pool-upgrade')
const { createClaimDefTransform } = require('./expansion/domain/claim-def')
const { createNodeTransform } = require('./expansion/pool/node')
const { transformNymAttrib } = require('./expansion/domain/nym-attrib')
const { txTypeToTxName } = require('indyscan-txtype/src/types')

const geoipLiteLookupIp = geoip.lookup.bind(geoip)

function createTransformerOriginal2Expansion ({ operationId, componentId, sourceLookups }) {
  const loggerMetadata = {
    metadaemon: {
      componentType: 'transformer-original2expansion',
      componentId,
      operationId
    }
  }

  let resolveDomainTxBySeqNo = async (seqNo) => {
    return sourceLookups.getTxData('domain', seqNo, 'original')
  }

  function noop (tx) {
    return Object.assign({}, tx)
  }

  const txTransforms = {
    'NYM': transformNymAttrib,
    'ATTRIB': transformNymAttrib,
    'SCHEMA': noop,
    'CLAIM_DEF': createClaimDefTransform(resolveDomainTxBySeqNo),
    'REVOC_REG_DEF': noop,
    'REVOC_REG_ENTRY': noop,
    'SET_CONTEXT': noop,
    'NODE': createNodeTransform(geoipLiteLookupIp),
    'POOL_UPGRADE': transformPoolUpgrade,
    'NODE_UPGRADE': noop,
    'POOL_CONFIG': noop,
    'AUTH_RULE': noop,
    'AUTH_RULES': noop,
    'TXN_AUTHOR_AGREEMENT': noop,
    'TXN_AUTHOR_AGREEMENT_AML': noop,
    'SET_FEES': noop,
    'UNKNOWN': noop
  }

  /*
  Should never throw. If tx specific transformation fails, this informmation will be captured in result object under
  "transformed.meta.transformError" object with fields "message" and "stack"
   */
  async function processTx (tx) {
    if (!tx) {
      throw Error('tx argument not defined')
    }
    const { txn, txnMetadata } = tx
    if (!txn || !txn.type) {
      throw Error(`txn.type was missing`)
    }
    const txnTypeName = txTypeToTxName(txn.type) || 'UNKNOWN'
    let processed = {
      txn: _.cloneDeep(txn),
      txnMetadata: _.cloneDeep(txnMetadata)
    }
    processed.txn.typeName = txnTypeName

    // genesis txs do not have time
    if (processed.txnMetadata && processed.txnMetadata.txnTime) {
      let epochMiliseconds = processed.txnMetadata.txnTime * 1000
      // convert txnTime from unix to ISO time
      processed.txnMetadata.txnTime = new Date(epochMiliseconds).toISOString()
    }

    try {
      const transform = txTransforms[txnTypeName]
      processed = await transform(processed)
    } catch (err) {
      processed.ierror = {
        message: err.message,
        stack: err.stack
      }
    }
    return { processedTx: processed, format: getOutputFormat() }
  }

  function getOutputFormat () {
    return 'expansion'
  }

  function getEsDomainMappingFields () {
    return {
      // TX: NYM, ATTRIB
      'txn.data.raw': { type: 'text' },
      'txn.data.dest': { type: 'keyword' },
      'txn.data.verkeyFull': { type: 'keyword' },
      'txn.data.roleAction': { type: 'keyword' },

      // TX: CLAIM_DEF
      'txn.data.refSchemaTxnSeqno': { type: 'integer' },
      'txn.data.refSchemaTxnTime': { type: 'date', format: 'date_time' },
      'txn.data.refSchemaVersion': { type: 'keyword' },
      'txn.data.refSchemaFrom': { type: 'keyword' }

    }
  }

  function getEsPoolMappingFields () {
    return {
      // TX: pool NODE transaction
      'txn.data.data.client_ip': {
        type: 'text',
        'fields': { 'raw': { 'type': 'keyword' }, 'as_ip': { type: 'ip', 'ignore_malformed': true } }
      },
      'txn.data.data.client_port': { type: 'integer' },
      'txn.data.data.node_ip': {
        type: 'text',
        'fields': { 'raw': { 'type': 'keyword' }, 'as_ip': { type: 'ip', 'ignore_malformed': true } }
      },
      'txn.data.data.node_ip_text': { type: 'text' },
      'txn.data.data.node_port': { type: 'integer' },

      // TX: NODE tx geo information
      'txn.data.data.client_ip_geo.location': { type: 'geo_point' },
      'txn.data.data.client_ip_geo.eu': { type: 'boolean' },
      'txn.data.data.node_ip_geo.location': { type: 'geo_point' },
      'txn.data.data.node_ip_geo.eu': { type: 'boolean' }
    }
  }

  function getEsConfigMappingFields () {
    return {
      // config POOL UPGRADE
      'txn.data.schedule.scheduleKey': { type: 'keyword' },
      'txn.data.schedule.scheduleTime': {
        type: 'date',
        format: 'strict_date_optional_time||epoch_millis||yyyy-MM-dd\'T\'HH:mm:ss.SSSZZ||yyyy-MM-dd\'T\'HH:mm.SSSZZ',
        ignore_malformed: true
      },

      // TX: domain AUTHOR_AGREEMENT_AML
      'txn.data.aml.at_submission': { type: 'text', analyzer: 'english' },
      'txn.data.aml.click_agreement': { type: 'text', analyzer: 'english' },
      'txn.data.aml.for_session': { type: 'text', analyzer: 'english' },
      'txn.data.aml.on_file': { type: 'text', analyzer: 'english' },
      'txn.data.aml.product_eula': { type: 'text', analyzer: 'english' },
      'txn.data.aml.service_agreement': { type: 'text', analyzer: 'english' },
      'txn.data.aml.wallet_agreement': { type: 'text', analyzer: 'english' },

      // TX: domain AUTHOR_AGREEMENT
      'txn.data.text': { type: 'text', analyzer: 'english' }
    }
  }

  function getEsCommonMappingFields () {
    return {
      // Every tx
      'txn.typeName': { type: 'keyword' },
      'txn.metadata.from': { type: 'keyword' },
      'txn.metadata.reqId': { type: 'keyword' },
      'txn.data.data.blskey': { type: 'keyword' },
      'txn.data.data.blskey_pop': { type: 'keyword' },
      'txn.data.txnTime': { type: 'date', format: 'date_time' }
      // 'txn.protocolVersion': {type: 'keyword'},
      // 'meta.scanTime': {type: 'date', format: 'date_time'},

      // 'ver': {type: 'keyword'},
      // 'rootHash': {type: 'keyword'},
      // 'txn.type': {type: 'keyword'},
      // 'subledger.code': {type: 'keyword'},
      // 'subledger.name': {type: 'keyword'},
      // 'txnMetadata.seqNo': {type: 'integer'},
    }
  }

  function getElasticsearchMappingDirectives () {
    return {
      ...getEsCommonMappingFields(),
      ...getEsDomainMappingFields(),
      ...getEsPoolMappingFields(),
      ...getEsConfigMappingFields()
    }
  }

  async function initializeTarget (target) {
    logger.info(`Initializing target.`, loggerMetadata)
    return intializeEsTarget(target, getOutputFormat(), getElasticsearchMappingDirectives())
  }

  function getObjectId () {
    return componentId
  }

  return {
    processTx,
    initializeTarget,
    getOutputFormat,
    getObjectId
  }
}

module.exports.createTransformerOriginal2Expansion = createTransformerOriginal2Expansion
