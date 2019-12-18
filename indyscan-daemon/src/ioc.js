let appObjects = {}

function interpolateConfiguration(configuration) {
  for (const key of Object.keys(configuration)) {
    if (key.match(/@.*/)) {
      let objectId = configuration[key]
      let object = appObjects[objectId]
      if (!object) {
        throw Error(`Failed to resolve object ${objectId}`)
      }

    }
  }
}

function registerTxSource(configuration) {

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
  const {sources, destinations, iterators, processors, pipelines} = daemonConfiguration
  registerTxSource(sources)
  registerTxDestination(destinations)
  registerTxProcessor(processors)
  registerTxIterator(iterators)
  registerTxPipeline(pipelines)
}

