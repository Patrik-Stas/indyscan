const logger = require('../logging/logger-main')
const { createIndyscanTransform } = require('./expansion/transform-tx')
const geoip = require('geoip-lite')
const geoipLiteLookupIp = geoip.lookup.bind(geoip)
const axios = require('axios')

function createTransformExpansion ({id, sourceLookups}) {
  let lookupTxBySeqno
  if (subledger.toUpperCase() === 'DOMAIN') {
    let simpleDbTxResolver = sourceLookups.getTxBySeqNo.bind(storageReadEs)
  } else {
    lookupTxBySeqno = (seqno) => {
      throw Error(`Tx-transform module tried to lookup ${subledger} transaction seqNo ${seqno} which was not expected.`)
    }
  }
  let createEsTransformedTx = createIndyscanTransform(lookupTxBySeqno, geoipLiteLookupIp)

  async function transform(originalTx) {
    createEsTransformedTx(originalTx)
  }

  function getEsDomainMappings() {
    return {
      // TX: NYM, ATTRIB
      'indyscan.txn.data.raw': { type: 'text' },
      'indyscan.txn.data.dest': { type: 'keyword' },
      'indyscan.txn.data.verkeyFull': { type: 'keyword' },
      'indyscan.txn.data.roleAction': { type: 'keyword' },

      // TX: CLAIM_DEF
      'indyscan.txn.data.refSchemaTxnSeqno': { type: 'integer' },
      'indyscan.txn.data.refSchemaTxnTime': { type: 'date', format: 'date_time' },
      'indyscan.txn.data.refSchemaVersion': { type: 'keyword' },
      'indyscan.txn.data.refSchemaFrom': { type: 'keyword' },

    }
  }

  function getEsPoolMappings() {
    return {
      // TX: pool NODE transaction
      'indyscan.txn.data.data.client_ip': { type: 'text', 'fields': { 'raw': { 'type': 'keyword' }, 'as_ip': { type: 'ip', 'ignore_malformed': true } } },
      'indyscan.txn.data.data.client_port': { type: 'integer' },
      'indyscan.txn.data.data.node_ip': { type: 'text', 'fields': { 'raw': { 'type': 'keyword' }, 'as_ip': { type: 'ip', 'ignore_malformed': true } } },
      'indyscan.txn.data.data.node_ip_text': { type: 'text' },
      'indyscan.txn.data.data.node_port': { type: 'integer' },

      // TX: NODE tx geo information
      'indyscan.txn.data.data.client_ip_geo.location': { type: 'geo_point' },
      'indyscan.txn.data.data.client_ip_geo.eu': { type: 'boolean' },
      'indyscan.txn.data.data.node_ip_geo.location': { type: 'geo_point' },
      'indyscan.txn.data.data.node_ip_geo.eu': { type: 'boolean' },
    }
  }

  function getEsConfigMappings() {
    return {
      // config POOL UPGRADE
      'indyscan.txn.data.schedule.scheduleKey': { type: 'keyword' },
      'indyscan.txn.data.schedule.scheduleTime': { type: 'date', format: "strict_date_optional_time||epoch_millis||yyyy-MM-dd'T'HH:mm:ss.SSSZZ||yyyy-MM-dd'T'HH:mm.SSSZZ", 'ignore_malformed': true },

      // TX: domain AUTHOR_AGREEMENT_AML
      'indyscan.txn.data.aml.at_submission': { type: 'text', analyzer: 'english' },
      'indyscan.txn.data.aml.click_agreement': { type: 'text', analyzer: 'english' },
      'indyscan.txn.data.aml.for_session': { type: 'text', analyzer: 'english' },
      'indyscan.txn.data.aml.on_file': { type: 'text', analyzer: 'english' },
      'indyscan.txn.data.aml.product_eula': { type: 'text', analyzer: 'english' },
      'indyscan.txn.data.aml.service_agreement': { type: 'text', analyzer: 'english' },
      'indyscan.txn.data.aml.wallet_agreement': { type: 'text', analyzer: 'english' },

      // TX: domain AUTHOR_AGREEMENT
      'indyscan.txn.data.text': { type: 'text', analyzer: 'english' }
    }
  }

  function getEsCommonMappings() {
    return {
      // Every tx
      'indyscan.ver': { type: 'keyword' },
      'indyscan.rootHash': { type: 'keyword' },
      'indyscan.txn.type': { type: 'keyword' },
      'indyscan.txn.typeName': { type: 'keyword' },
      'indyscan.subledger.code': { type: 'keyword' },
      'indyscan.subledger.name': { type: 'keyword' },
      'indyscan.txn.protocolVersion': { type: 'keyword' },
      'indyscan.txn.metadata.from': { type: 'keyword' },
      'indyscan.txn.metadata.reqId': { type: 'keyword' },
      'indyscan.txn.data.data.blskey': { type: 'keyword' },
      'indyscan.txn.data.data.blskey_pop': { type: 'keyword' },
      'indyscan.meta.scanTime': { type: 'date', format: 'date_time' },

      'indyscan.txnMetadata.seqNo': { type: 'integer' },
      'indyscan.txnMetadata.txnTime': { type: 'date', format: 'date_time' },
    }
  }

  // TODO: This gotta go out here, not responsibility of this module to care about original tx format
  function getEsOriginalFormatMapping() {
    return {
      "original": { type: 'text', index: false },
    }
  }

  function getEsLegacyAllInOneMappings() {
    return {
      "properties": {
        ... getEsCommonMappings(),
        ... getEsDomainMappings(),
        ... getEsPoolMappings(),
        ... getEsConfigMappings(),
        ... getEsOriginalFormatMapping()
      }
    }
  }

  return {
    transform,
    initializeDatastore,
    getEsLegacyAllInOneMappings
  }

}
