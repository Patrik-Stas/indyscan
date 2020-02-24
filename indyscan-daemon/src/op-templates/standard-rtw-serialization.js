// "RTW Ledger->Elasticsearch for network {{{INDY_NETWORK}}} into ES {{{URL_ELASTICSEARCH}}}, index {{{TARGET_INDEX}}}"
const { createTargetElasticsearch } = require('../targets/target-elasticsearch')
const { createWorkerRtw } = require('../workers/worker-rtw')
const { createIteratorGuided } = require('../iterators/iterator-guided')
const { createTransformerSerializer } = require('../transformers/transformer-serializer')
const { createSourceElasticsearch } = require('../sources/source-elasticsearch')
const { createSourceLedger } = require('../sources/source-ledger')

async function createNetOpRtwSerialization (indyNetworkName, genesisPath, esUrl, esIndex, workerTiming) {
  const sourceLedger = await createSourceLedger({
    id: `source.ledger.${indyNetworkName}`,
    name: indyNetworkName,
    genesisPath
  })
  const sourceEs = await createSourceElasticsearch({ id: 'source.es.{{{INDY_NETWORK}}}', index: esIndex, url: esUrl })
  const targetEs = await createTargetElasticsearch({ id: `target.${indyNetworkName}`, url: esUrl, index: esIndex, replicas: 0 })
  const transformer = await createTransformerSerializer({ id: `transformer.serializer.${indyNetworkName}` })
  const iterateLedgerByDbOriginalTxs = createIteratorGuided({
    id: `iterate-ledger-${indyNetworkName}-by-es-original`,
    source: sourceLedger,
    sourceSeqNoGuidance: sourceEs,
    guidanceFormat: transformer.getOutputFormat()
  })

  const rtwDomain = createWorkerRtw({
    id: `worker.rtw.${indyNetworkName}.domain`,
    subledger: 'domain',
    iteratorTxFormat: 'original',
    transformer,
    target: targetEs,
    iterator: iterateLedgerByDbOriginalTxs,
    timing: workerTiming
  })
  const rtwConfig = createWorkerRtw({
    id: `worker.rtw.${indyNetworkName}.config`,
    subledger: 'config',
    iteratorTxFormat: 'original',
    transformer,
    target: targetEs,
    iterator: iterateLedgerByDbOriginalTxs,
    timing: workerTiming
  })
  const rtwPool = createWorkerRtw({
    id: `worker.rtw.${indyNetworkName}.pool`,
    subledger: 'pool',
    iteratorTxFormat: 'original',
    transformer,
    target: targetEs,
    iterator: iterateLedgerByDbOriginalTxs,
    timing: workerTiming
  })
  return [rtwDomain, rtwConfig, rtwPool]
}

module.exports.createNetOpRtwSerialization = createNetOpRtwSerialization
