const { createTransformerPipeline } = require('../transformers/transformer-pipeline')
const { createTransformerSerialized2Original } = require('../transformers/transformer-serialized2original')
const { createTransformerOriginal2Expansion } = require('../transformers/transformer-original2expansion')
const { createTargetElasticsearch } = require('../targets/target-elasticsearch')
const { createWorkerRtw } = require('../workers/worker-rtw')
const { createIteratorGuided } = require('../iterators/iterator-guided')
const { createSourceElasticsearch } = require('../sources/source-elasticsearch')

async function createNetOpRtwExpansion (esUrl, esIndex, workerTiming, operationId) {
  operationId = operationId || `dbexpansion-${esIndex}`

  const sourceEs = await createSourceElasticsearch({
    operationId,
    componentId: `${operationId}.source.es`,
    url: esUrl,
    index: esIndex
  })
  const targetEs = await createTargetElasticsearch({
    operationId,
    componentId: `${operationId}.target.es`,
    url: esUrl,
    index: esIndex
  })
  const deserializer = await createTransformerSerialized2Original({
    operationId,
    componentId: `transformer.Serialized2Original`
  })
  const expander = await createTransformerOriginal2Expansion({
    operationId,
    componentId: `transformer.Original2Expansion`,
    sourceLookups: sourceEs
  })

  const transformer = createTransformerPipeline({
    operationId,
    componentId: `${operationId}.transformer.pipeline[deserializer->expander]`,
    transformers: [deserializer, expander]
  })
  const guidanceFormat = transformer.getOutputFormat()
  const iterateLedgerByDbExpansionTxs = createIteratorGuided({
    operationId,
    componentId: `${operationId}.iterator.guided.${guidanceFormat}`,
    source: sourceEs,
    sourceSeqNoGuidance: sourceEs,
    guidanceFormat
  })

  const workers = []
  for (const subledger of ['domain', 'config', 'pool']) {
    const worker = await createWorkerRtw({
      operationId,
      componentId: `${operationId}.worker.serialized2expansion.${subledger}`,
      subledger,
      iteratorTxFormat: 'serialized',
      transformer,
      target: targetEs,
      iterator: iterateLedgerByDbExpansionTxs,
      timing: workerTiming,
      operationName: operationId
    })
    workers.push(worker)
  }
  return workers
}

module.exports.createNetOpRtwExpansion = createNetOpRtwExpansion
