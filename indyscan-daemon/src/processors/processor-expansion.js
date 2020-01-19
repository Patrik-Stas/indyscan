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

  return {
    transform,
    initializeDatastore
  }

}
