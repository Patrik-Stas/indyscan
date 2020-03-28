const { createTransformerPipeline } = require('../transformers/transformer-pipeline')
const { createTransformerSerialized2Original } = require('../transformers/transformer-serialized2original')
const { createTransformerOriginal2Expansion } = require('../transformers/transformer-original2expansion')
const { createTargetElasticsearch } = require('../targets/target-elasticsearch')
const { createWorkerRtw } = require('../workers/worker-rtw')
const { createIteratorGuided } = require('../iterators/iterator-guided')
const { createSourceElasticsearch } = require('../sources/source-elasticsearch')

async function createNetOpRtwExpansion ({ indyNetworkId, esUrl, esIndex, workerTiming }) {
  const operationType = 'expansion'

  const sourceEs = await createSourceElasticsearch({
    indyNetworkId,
    url: esUrl,
    index: esIndex
  })
  const targetEs = await createTargetElasticsearch({
    indyNetworkId,
    url: esUrl,
    index: esIndex
  })
  const deserializer = await createTransformerSerialized2Original({
    indyNetworkId
  })
  const expander = await createTransformerOriginal2Expansion({
    indyNetworkId,
    sourceLookups: sourceEs
  })

  const transformer = createTransformerPipeline({
    indyNetworkId,
    transformers: [deserializer, expander]
  })
  const guidanceFormat = transformer.getOutputFormat()
  const iterateLedgerByDbExpansionTxs = createIteratorGuided({
    indyNetworkId,
    source: sourceEs,
    sourceSeqNoGuidance: sourceEs,
    guidanceFormat
  })

  const workers = []
  for (const subledger of ['domain', 'config', 'pool']) {
    const worker = await createWorkerRtw({
      indyNetworkId,
      operationType,
      subledger,
      iteratorTxFormat: 'serialized',
      transformer,
      target: targetEs,
      iterator: iterateLedgerByDbExpansionTxs,
      timing: workerTiming,
      operationName: operationType
    })
    workers.push(worker)
  }
  return {workers, sources: [sourceEs], targets: [targetEs], transformers: [transformer], iterators: [iterateLedgerByDbExpansionTxs]}
}

module.exports.createNetOpRtwExpansion = createNetOpRtwExpansion
