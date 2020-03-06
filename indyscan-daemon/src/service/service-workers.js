const logger = require('../logging/logger-main')

function createServiceWorkers() {

  let workers = []

  function registerWorker(worker) {
    logger.info(`Registering new worker '${worker.getObjectId()}'.`)
    workers.push(worker)
  }

  async function getAllWorkersInfo() {
    return workers.map(worker => worker.getWorkerInfo())
  }

  return {
    getAllWorkersInfo,
    registerWorker
  }
}

module.exports.createServiceWorkers = createServiceWorkers
