const { buildImplementation } = require('./factory')
const { registerInstance, injectDependencies } = require('./di-container')
const logger = require('./logging/logger-main')
const { interfaces } = require('./factory')

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
    const objectInstance = await buildImplementation(objectConfig)
    instances.push(objectInstance)
  }
  return instances
}

async function injectDependenciesIntoConfigs (objectConfigs) {
  for (const objectConfig of objectConfigs) {
    injectDependencies(objectConfig)
  }
}

async function injectBuildRegister (objectConfigs) {
  logger.info(`Building object configs ${JSON.stringify(objectConfigs)}`)
  await injectDependenciesIntoConfigs(objectConfigs)
  logger.debug(`Object configs after DI: ${JSON.stringify(objectConfigs)}`)
  let instances = await buildObjectInstances(objectConfigs)
  logger.debug(`Built instances ${JSON.stringify(instances)}`)
  await registerObjects(instances)
  return instances
}

async function bootstrapApp (objectsConfig) {
  const sourceConfigs = objectsConfig.filter(o => o.interface.toLowerCase() === interfaces.source)
  const configTargets = objectsConfig.filter(o => o.interface.toLowerCase() === interfaces.target)
  const configIterators = objectsConfig.filter(o => o.interface.toLowerCase() === interfaces.iterator)
  const configProcessors = objectsConfig.filter(o => o.interface.toLowerCase() === interfaces.processor)
  const configPipelines = objectsConfig.filter(o => o.interface.toLowerCase() === interfaces.pipeline)
  await injectBuildRegister(sourceConfigs)
  await injectBuildRegister(configTargets)
  await injectBuildRegister(configIterators)
  await injectBuildRegister(configProcessors)
  return injectBuildRegister(configPipelines)
}

module.exports.bootstrapApp = bootstrapApp
