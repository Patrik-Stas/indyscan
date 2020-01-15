let appObjects = {}

const interfaces = {
  SOURCE: "SOURCE",
  TARGET: "TARGET",
  ITERATOR: "ITERATOR",
  PROCESSOR: "PROCESSOR",
  PIPELINE: "PIPELINE",
}

const implementations = {
  "SOURCE" : {
    "LEDGER": require('./sources/source-ledger'),
    "ELASTICSEARCH": require('./sources/source-elasticsearch')
  }
}

function registerTxSource(objectConfigs) {
  for (const objectConfig of objectConfigs)
}

function registerTxDestination(configuration) {

}

function registerTxProcessor(configuration) {

}

function registerTxIterator(configuration) {

}

function registerTxPipeline(configuration) {

}

function processConfiguration(daemonConfiguration) {
  const {objects} = daemonConfiguration
  let sources = objects.filter(o=>o.interface === 'SOURCE')

}

