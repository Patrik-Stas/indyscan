// "RTW Ledger->Elasticsearch for network {{{INDY_NETWORK}}} into ES {{{URL_ELASTICSEARCH}}}, index {{{TARGET_INDEX}}}"
const {createTransformerOriginal2Serialized} = require('../transformers/transformer-original2serialized')
const { createWorkerRtw } = require('../workers/worker-rtw')
const { createIteratorGuided } = require('../iterators/iterator-guided')
const { createTargetElasticsearch } = require('../targets/target-elasticsearch')
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
  const transformer = await createTransformerOriginal2Serialized({ id: `transformer.serializer.${indyNetworkName}` })
  const iterateLedgerByDbOriginalTxs = createIteratorGuided({
    id: `iterate-ledger-${indyNetworkName}-by-es-original`,
    source: sourceLedger,
    sourceSeqNoGuidance: sourceEs,
    guidanceFormat: transformer.getOutputFormat()
  })
  const workers = []
  for (const subledger of ['domain', 'config', 'pool']) {
    const worker = createWorkerRtw({
      id: `worker.legerOriginal2Serialized.${indyNetworkName}.${subledger}`,
      subledger,
      iteratorTxFormat: 'original',
      transformers: [transformer],
      target: targetEs,
      iterator: iterateLedgerByDbOriginalTxs,
      timing: workerTiming
    })
    workers.push(worker)
  }
  return workers
}

module.exports.createNetOpRtwSerialization = createNetOpRtwSerialization
