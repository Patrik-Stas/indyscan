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

  function getAllWorkers () {
    return Object.values(workers)
  }

  function getAllWorkersInfo () {
    return getAllWorkers().map(worker => worker.getWorkerInfo())
  }

  function enableAll () {
    const workers = getAllWorkers()
    for (const worker of workers) {
      worker.enable()
    }
  }

  function disableAll () {
    const workers = getAllWorkers()
    for (const worker of workers) {
      worker.enable()
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
    getAllWorkers,
    getAllWorkersInfo,
    registerWorker,
    enableAll,
    disableAll,
    enableOne,
    disableOne,
    flipStateOne
  }
}

module.exports.createServiceWorkers = createServiceWorkers
