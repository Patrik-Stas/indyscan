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
    operationType,
    componentId: `${indyNetworkId}.${operationType}.source.es`,
    url: esUrl,
    index: esIndex
  })
  const targetEs = await createTargetElasticsearch({
    indyNetworkId,
    operationType,
    componentId: `${indyNetworkId}.${operationType}.target.es`,
    url: esUrl,
    index: esIndex
  })
  const deserializer = await createTransformerSerialized2Original({
    indyNetworkId,
    operationType,
    componentId: `${indyNetworkId}.transformer.Serialized2Original`
  })
  const expander = await createTransformerOriginal2Expansion({
    indyNetworkId,
    operationType,
    componentId: `${indyNetworkId}.transformer.Original2Expansion`,
    sourceLookups: sourceEs
  })

  const transformer = createTransformerPipeline({
    indyNetworkId,
    operationType,
    componentId: `${operationType}.transformer.pipeline[deserializer->expander]`,
    transformers: [deserializer, expander]
  })
  const guidanceFormat = transformer.getOutputFormat()
  const iterateLedgerByDbExpansionTxs = createIteratorGuided({
    indyNetworkId,
    operationType,
    componentId: `${indyNetworkId}.${operationType}.iterator.guided.${guidanceFormat}`,
    source: sourceEs,
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
