const { getAppConfigPaths } = require('./config/env')
const logger = require('./logging/logger-main')
const _ = require('lodash')

// TODO: Setting up IndySKD logging here is causing seemmingly random crashes!
// const indy = require('indy-sdk')
// indy.setLogger(function (level, target, message, modulePath, file, line) {
//   if (level === 1) {
//     logger.error(`INDYSDK: ${message}`)
//   } else if (level === 2) {
//     logger.warn(`INDYSDK: ${message}`)
//   } else if (level === 3) {
//     logger.info(`INDYSDK: ${message}`)
//   } else if (level === 4) {
//     logger.debug(`INDYSDK: ${message}`)
//   } else {
//     logger.silly(`INDYSDK: ${message}`)
//   }
// })

async function run () {
  const operationConfigPaths = getAppConfigPaths()
  logger.info(`Will bootstrap app from following operations definitions`)
  logger.info(JSON.stringify(operationConfigPaths, null, 2))

  let workers = []
  for (const opConfig of operationConfigPaths) {
    const buildOperation = require(opConfig)
    const opWorkers = await buildOperation()
    workers.push(opWorkers)
  }
  workers = _.flattenDeep(workers)
  console.log(JSON.stringify(workers))
  for (const worker of workers) {
    logger.info(`Starting worker ${worker.getObjectId()}`)
    worker.start()
  }
}

run()
