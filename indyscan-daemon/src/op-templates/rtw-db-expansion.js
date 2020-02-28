const {createTransformerPipeline} = require('../transformers/transformer-pipeline')
const {createTransformerSerialized2Original} = require('../transformers/transformer-serialized2original')
const {createTransformerOriginal2Expansion} = require('../transformers/transformer-original2expansion')
const {createTargetElasticsearch} = require('../targets/target-elasticsearch')
const {createWorkerRtw} = require('../workers/worker-rtw')
const {createIteratorGuided} = require('../iterators/iterator-guided')
const {createSourceElasticsearch} = require('../sources/source-elasticsearch')

async function createNetOpRtwExpansion (indyNetworkName, genesisPath, esUrl, esIndex, workerTiming) {
  const sourceEs = await createSourceElasticsearch({id: `source.${indyNetworkName}`, url: esUrl, index: esIndex})
  const targetEs = await createTargetElasticsearch({id: `target.${indyNetworkName}`, url: esUrl, index: esIndex})
  const deserializer = await createTransformerSerialized2Original({id: `transformer.serializer.${indyNetworkName}`})
  const expander = await createTransformerOriginal2Expansion({id: `transformer.serializer.${indyNetworkName}`})
  const iterateLedgerByDbExpansionTxs = createIteratorGuided({
    id: `iterate-ledger-${indyNetworkName}-by-es-original`,
    source: sourceEs,
    sourceSeqNoGuidance: sourceEs,
    guidanceFormat: 'expansion'
  })

  const workers = []
  for (const subledger of ['domain', 'config', 'pool']) {
    const worker = createWorkerRtw({
      id: `worker.dbserialized2expansion.${indyNetworkName}.${subledger}`,
      subledger,
      iteratorTxFormat: 'serialized',
      transformer: createTransformerPipeline({
        id: 'transformer::deserializer-expander-pipeline',
        transformers: [deserializer, expander]
      }),
      target: targetEs,
      iterator: iterateLedgerByDbExpansionTxs,
      timing: workerTiming
    })
    workers.push(worker)
  }
  return workers
}

module.exports.createNetOpRtwExpansion = createNetOpRtwExpansion
