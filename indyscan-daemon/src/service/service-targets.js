const logger = require('../logging/logger-main')

function createServiceTargets () {
  const targets = {}

  function registerTarget (target) {
    const id = target.getObjectId()
    logger.info(`Registering new worker '${id}'.`)
    if (targets[id]) {
      throw Error(`Duplicate worker ID. Worker ${id} was already registered.`)
    }
    targets[id] = target
  }

  function getTarget (id) {
    const target = targets[id]
    if (!target) {
      throw Error(`Target ${id} not found.`)
    }
    return target
  }

  function getTargetInfo (id) {
    const target = getTarget(id)
    return target.getTargetInfo()
  }

  return {
    getTargetInfo,
    registerTarget
  }
}

module.exports.createServiceTargets = createServiceTargets
