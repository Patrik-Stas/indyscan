const logger = require('../logging/logger-main')

function createServiceWorkers () {
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
      const {workerIds, operationTypes, subledgers, targetEsIndices, indyNetworkIds} = workerQuery
      if (workerIds) {
        resWorkers = resWorkers.filter(worker => workerIds.includes(worker.getWorkerInfo().workerId))
      }
      if (indyNetworkIds) {
        resWorkers = resWorkers.filter(worker => indyNetworkIds.includes(worker.getWorkerInfo().indyNetworkId))
      }
      if (operationTypes) {
        resWorkers = resWorkers.filter(worker => operationTypes.includes(worker.getWorkerInfo().operationType))
      }
      if (subledgers) {
        resWorkers = resWorkers.filter(worker => subledgers.includes(worker.getWorkerInfo().subledger))
      }
      if (targetEsIndices) {
        resWorkers = resWorkers.filter(worker => {
          const workerTarget = worker.getWorkerInfo().targetInfo
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

  function getWorker (id) {
    return workers[id]
  }

  function getWorkersInfo (workerQuery) {
    return getWorkers(workerQuery).map(worker => worker.getWorkerInfo())
  }

  function getWorkerInfo (id) {
    const worker = getWorker(id)
    if (!worker) {
      return undefined
    }
    return worker.getWorkerInfo()
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

  return {
    getWorker,
    getWorkers,
    getWorkersInfo,
    getWorkerInfo,
    registerWorker,
    enableWorkers,
    disableWorkers,
    flipWorkersState
  }
}

module.exports.createServiceWorkers = createServiceWorkers
