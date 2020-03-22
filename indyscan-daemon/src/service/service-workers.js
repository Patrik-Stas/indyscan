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
      if (workerQuery.operationType) {
        resWorkers = resWorkers.filter(worker => worker.getWorkerInfo().operationType === workerQuery.operationType)
      }
      if (workerQuery.subledger) {
        resWorkers = resWorkers.filter(worker => worker.getWorkerInfo().subledger === workerQuery.subledger)
      }
      if (workerQuery.targetEsIndex) {
        resWorkers = resWorkers.filter(worker => {
          const target = serviceTargets.getTargetInfo(worker.getWorkerInfo().targetComponentId)
          return target.esIndex === workerQuery.targetEsIndex
        })
      }
    }
    return resWorkers
  }

  function getWorkersInfo (workerQuery) {
    return getWorkers(workerQuery).map(worker => worker.getWorkerInfo())
  }

  function enableAll () {
    const workers = getWorkers()
    for (const worker of workers) {
      worker.enable()
    }
  }

  function disableAll () {
    const workers = getWorkers()
    for (const worker of workers) {
      worker.disable()
    }
  }

  function getWorker (id) {
    const worker = workers[id]
    if (!worker) {
      throw Error(`Worker ${id} not found.`)
    }
    return worker
  }

  function enableOne (id) {
    getWorker(id).enable()
  }

  function disableOne (id) {
    getWorker(id).disable()
  }

  function flipStateOne (id) {
    getWorker(id).flipState()
  }

  return {
    getWorkers,
    getWorkersInfo,
    registerWorker,
    enableAll,
    disableAll,
    enableOne,
    disableOne,
    flipStateOne
  }
}

module.exports.createServiceWorkers = createServiceWorkers
