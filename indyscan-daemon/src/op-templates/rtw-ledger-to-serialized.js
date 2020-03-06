// "RTW Ledger->Elasticsearch for network {{{INDY_NETWORK}}} into ES {{{URL_ELASTICSEARCH}}}, index {{{TARGET_INDEX}}}"
const { createTransformerOriginal2Serialized } = require('../transformers/transformer-original2serialized')
const { createWorkerRtw } = require('../workers/worker-rtw')
const { createIteratorGuided } = require('../iterators/iterator-guided')
const { createTargetElasticsearch } = require('../targets/target-elasticsearch')
const { createSourceElasticsearch } = require('../sources/source-elasticsearch')
const { createSourceLedger } = require('../sources/source-ledger')

async function createNetOpRtwSerialization (indyNetworkId, genesisPath, esUrl, esIndex, workerTiming, operationId) {
  operationId = operationId || `ledgercpy-${indyNetworkId}-to-${esIndex}`
  const sourceLedger = await createSourceLedger({
    operationId,
    componentId: `${operationId}.source.ledger`,
    name: indyNetworkId,
    genesisPath
  })

  const sourceEs = await createSourceElasticsearch({
    indyNetworkId,
    operationId,
    componentId: `${operationId}.source.es`,
    index: esIndex,
    url: esUrl
  })
  const targetEs = await createTargetElasticsearch({
    indyNetworkId,
    operationId,
    componentId: `${operationId}.target.es`,
    url: esUrl,
    index: esIndex,
    replicas: 0
  })
  const transformer = await createTransformerOriginal2Serialized({
    indyNetworkId,
    operationId,
    componentId: `transformer.original2serialized`
  })
  const guidanceFormat = transformer.getOutputFormat()
  const iterateLedgerByDbOriginalTxs = createIteratorGuided({
    indyNetworkId,
    operationId,
    componentId: `${operationId}.iterator.guided.${guidanceFormat}`,
    source: sourceLedger,
    sourceSeqNoGuidance: sourceEs,
    guidanceFormat
  })

  const workers = []
  for (const subledger of ['domain', 'config', 'pool']) {
    const worker = await createWorkerRtw({
      indyNetworkId,
      operationId,
      componentId: `${operationId}.worker.original2Serialized.${subledger}`,
      subledger,
      iteratorTxFormat: 'original',
      transformer: transformer,
      target: targetEs,
      iterator: iterateLedgerByDbOriginalTxs,
      timing: workerTiming
    })
    workers.push(worker)
  }
  return workers
}

module.exports.createNetOpRtwSerialization = createNetOpRtwSerialization
