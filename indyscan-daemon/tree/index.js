const { createStorageReadEs } = require('indyscan-storage')
const logger = require('../src/logging/logger-main')
const { txTypeToTxName } = require('indyscan-txtype')

const esClient = new elasticsearch.Client({ node: urlEs })
logger.debug(`Creating ElasticSearch storages for network '${esIndex}'.`)
const storageReadEs = createStorageReadEs(esClient, esIndex, subledger, logger)

let dids = {}

function tryParseEndpoint (rawData) {
  let parsed
  let endpoint
  let lastUpdated
  try {
    parsed = JSON.parse(rawData)
    if (parsed['endpoint']) {
      if (parsed.endpoint.endpoint) {
        endpoint = parsed.endpoint.endpoint
      } else if (parsed.endpoint.agent) {
        endpoint = parsed.endpoint.agent
      } else if (parsed.endpoint.xdi) {
        endpoint = parsed.endpoint.xdi
      } else if (parsed.endpoint.processor_url) {
        endpoint = parsed.endpoint.processor_url
      } else if (parsed.endpoint.controller_url) {
        endpoint = parsed.endpoint.controller_url
      }
    } else if (parsed['url']) {
      endpoint = parsed.url
    }
  } catch (err) {}
  return { endpoint }
}

async function buildNymTree (getNextTx) {
  let tx = await getNextTx()
  let txTypeName = txTypeToTxName(tx.txn.txnType)
  if (txTypeName === 'NYM') {
    let { did: dest, alias, raw } = tx.txn.data
    let didData = {alias, verkey}
    let {endpoint} = tryParseEndpoint(raw)
    if (endpoint) {
      didData['endpoint'] = endpoint
    }
    dids[did] = didData
  }
  if (txTypeName === 'ATTRIB') {
  }
}
