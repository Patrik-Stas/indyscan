const {registerInstance, injectDependencies} = require('./di-container')
const {buildSourceFactory} = require('./sources/source-factory')

const interfaces = {
  SOURCE: 'SOURCE',
  TARGET: 'TARGET',
  ITERATOR: 'ITERATOR',
  PROCESSOR: 'PROCESSOR',
  PIPELINE: 'PIPELINE',
}

const sourceFactory = buildSourceFactory()
const factory = createGeneralFactory([sourceFactory])


async function registerObject (objectInstance) {
  registerInstance(objectInstance.getObjectId(), objectInstance)
}

async function registerObjects (objectInstances) {
  for (const object of objectInstances) {
    await registerObject(object)
  }
}

async function buildObjectInstances (objectConfigs) {
  let instances = []
  for (const objectConfig of objectConfigs) {
    const objectInstance = await factory.buildImplementation(objectConfig)
    instances.push(objectInstance)
  }
  return instances
}

async function injectDependenciesIntoConfigs(objectConfigs) {
  for (const objectConfig of objectConfigs) {
    injectDependencies(objectConfig)
  }
}

async function bootstrapApp (objectsConfig) {
  let sourceConfigs = objectsConfig.filter(o => o.interface.toUpperCase() === interfaces.SOURCE)
  // let configTargets = objectsConfig.filter(o => o.interface.toUpperCase() === interfaces.TARGET)
  // let configIterators = objectsConfig.filter(o => o.interface.toUpperCase() === interfaces.ITERATOR)
  // let configProcessors = objectsConfig.filter(o => o.interface.toUpperCase() === interfaces.PROCESSOR)
  // let configPipelines = objectsConfig.filter(o => o.interface.toUpperCase() === interfaces.PIPELINE)
  injectDependenciesIntoConfigs(sourceConfigs)
  let sourceInstances = await buildObjectInstances(sourceConfigs)
  await registerObjects(sourceInstances)
  // await registerTxDestination(targets)
  // await registerTxIterator(iterators)
  // await registerTxProcessor(processors)
  // await registerTxPipeline(pipelines)
  let pipelineInstances = []
  return pipelineInstances
}

module.exports.bootstrapApp = bootstrapApp

