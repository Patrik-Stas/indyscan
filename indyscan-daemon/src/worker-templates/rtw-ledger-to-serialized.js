const { createTransformerOriginal2Serialized } = require('../transformers/transformer-original2serialized')
const { createWorkerRtw } = require('../workers/worker-rtw')
const { createIteratorGuided } = require('../iterators/iterator-guided')
const { createTargetElasticsearch } = require('../targets/target-elasticsearch')
const { createSourceElasticsearch } = require('../sources/source-elasticsearch')
const { createSourceLedger } = require('../sources/source-ledger')
const { OPERATION_TYPES } = require('../constants')


async function createNetOpRtwSerialization ({ indyNetworkId, genesisPath, esUrl, esIndex, workerTiming }) {
  const operationType = OPERATION_TYPES.LEDGER_CPY
  const sourceLedger = await createSourceLedger({
    name: indyNetworkId,
    genesisPath
  })
  const sourceEs = await createSourceElasticsearch({
    indyNetworkId,
    index: esIndex,
    url: esUrl
  })
  const targetEs = await createTargetElasticsearch({
    indyNetworkId,
    url: esUrl,
    index: esIndex,
    replicas: 0
  })
  const transformer = await createTransformerOriginal2Serialized({
    indyNetworkId
  })
  const guidanceFormat = transformer.getOutputFormat()
  const iterateLedgerByDbOriginalTxs = createIteratorGuided({
    indyNetworkId,
    source: sourceLedger,
    sourceSeqNoGuidance: sourceEs,
    guidanceFormat
  })

  const workers = []
  for (const subledger of ['domain', 'config', 'pool']) {
    const worker = await createWorkerRtw({
      indyNetworkId,
      subledger,
      operationType,
      iteratorTxFormat: 'original',
      transformer: transformer,
      target: targetEs,
      iterator: iterateLedgerByDbOriginalTxs,
      timing: workerTiming
    })
    workers.push(worker)
  }
  return {
    workers,
    sources: [sourceEs, sourceLedger],
    targets: [targetEs],
    transformers: [transformer],
    iterators: [iterateLedgerByDbOriginalTxs]
  }
}

module.exports.createNetOpRtwSerialization = createNetOpRtwSerialization
