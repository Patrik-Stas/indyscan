const logger = require('../logging/logger-main')

function createServiceWorkers (serviceTargets) {
  const workers = {}

  function registerWorker (worker) {
    const id = worker.getObjectId()
    logger.info(`Registering new worker '${id}'.`)
    if (workers[id]) {
      throw Error(`Duplicate worker ID. Worker ${id} was already registered.`)
    }
    workers[id] = worker
  }

  function getWorkers (workerQuery) {
    logger.info(`Get workers, worker query =${JSON.stringify(workerQuery)}`)
    let resWorkers = Object.values(workers)
    if (workerQuery) {
      const {workerIds, operationTypes, subledgers, targetEsIndices} = workerQuery
      if (workerIds) {
        resWorkers = resWorkers.filter(worker => workerIds.includes(worker.getWorkerInfo().componentId))
      }
      if (operationTypes) {
        resWorkers = resWorkers.filter(worker => operationTypes.includes(worker.getWorkerInfo().operationType))
      }
      if (subledgers) {
        resWorkers = resWorkers.filter(worker => subledgers.includes(worker.getWorkerInfo().subledger))
      }
      if (targetEsIndices) {
        resWorkers = resWorkers.filter(worker => {
          const workerTarget = serviceTargets.getTargetInfo(worker.getWorkerInfo().targetComponentId)
          const workerTargetEsIndex = workerTarget.esIndex
          if (workerTargetEsIndex) {
            return targetEsIndices.includes(workerTargetEsIndex)
          } else {
            return false
          }
        })
      }
    }
    return resWorkers
  }

  function getWorkersInfo (workerQuery) {
    return getWorkers(workerQuery).map(worker => worker.getWorkerInfo())
  }

  function enableWorkers (workerQuery) {
    const workers = getWorkers(workerQuery)
    for (const worker of workers) {
      worker.enable()
    }
  }

  function disableWorkers (workerQuery) {
    const workers = getWorkers(workerQuery)
    for (const worker of workers) {
      worker.disable()
    }
  }

  function flipWorkersState (workerQuery)  {
    const workers = getWorkers(workerQuery)
    for (const worker of workers) {
      worker.flipState()
    }
  }

  function getWorker (id) {
    const worker = workers[id]
    if (!worker) {
      throw Error(`Worker ${id} not found.`)
    }
    return worker
  }

  return {
    getWorkers,
    getWorkersInfo,
    registerWorker,
    enableWorkers,
    disableWorkers,
    flipWorkersState
  }
}

module.exports.createServiceWorkers = createServiceWorkers
