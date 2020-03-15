const { createTransformerOriginal2Serialized } = require('../transformers/transformer-original2serialized')
const { createWorkerRtw } = require('../workers/worker-rtw')
const { createIteratorGuided } = require('../iterators/iterator-guided')
const { createTargetElasticsearch } = require('../targets/target-elasticsearch')
const { createSourceElasticsearch } = require('../sources/source-elasticsearch')
const { createSourceLedger } = require('../sources/source-ledger')

async function createNetOpRtwSerialization ({ indyNetworkId, genesisPath, esUrl, esIndex, workerTiming }) {
  const operationType = 'ledgercpy'
  const sourceLedger = await createSourceLedger({
    operationType,
    componentId: `${operationType}.source.ledger`,
    name: indyNetworkId,
    genesisPath
  })

  const sourceEs = await createSourceElasticsearch({
    indyNetworkId,
    operationType,
    componentId: `${operationType}.source.es`,
    index: esIndex,
    url: esUrl
  })
  const targetEs = await createTargetElasticsearch({
    indyNetworkId,
    operationType,
    componentId: `${operationType}.target.es`,
    url: esUrl,
    index: esIndex,
    replicas: 0
  })
  const transformer = await createTransformerOriginal2Serialized({
    indyNetworkId,
    operationType,
    componentId: 'transformer.original2serialized'
  })
  const guidanceFormat = transformer.getOutputFormat()
  const iterateLedgerByDbOriginalTxs = createIteratorGuided({
    indyNetworkId,
    operationType,
    componentId: `${operationType}.iterator.guided.${guidanceFormat}`,
    source: sourceLedger,
    sourceSeqNoGuidance: sourceEs,
    guidanceFormat
  })

  const workers = []
  for (const subledger of ['domain', 'config', 'pool']) {
    const worker = await createWorkerRtw({
      indyNetworkId,
      operationType,
      componentId: `${indyNetworkId}.${operationType}.${subledger}`,
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
