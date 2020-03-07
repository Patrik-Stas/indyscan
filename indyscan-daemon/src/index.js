const { getAppConfigPaths, envConfig } = require('./config/env')
const logger = require('./logging/logger-main')
const _ = require('lodash')
const sleep = require('sleep-promise')
const util = require('util')
const { startServer } = require('./server/server')
const { createServiceWorkers } = require('./service/service-workers')

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
  let serviceWorkers = createServiceWorkers()
  try {
    const operationConfigPaths = getAppConfigPaths()
    await sleep(2000)
    logger.info(`Will bootstrap app from following operations definitions ${JSON.stringify(operationConfigPaths, null, 2)}`)

    let workers = []
    for (const opConfig of operationConfigPaths) {
      const buildOperation = require(opConfig)
      const opWorkers = await buildOperation()
      workers.push(opWorkers)
    }
    workers = _.flattenDeep(workers)
    for (const worker of workers) {
      logger.info(`Going to enable worker ${worker.getObjectId()}`)
      serviceWorkers.registerWorker(worker)
    }
  } catch (e) {
    console.error(util.inspect(e))
  }

  if (envConfig.AUTOSTART) {
    let workers = serviceWorkers.getAllWorkers()
    for (const worker of workers) {
      worker.start()
    }
  }
  if (envConfig.SERVER_ENABLED ) {
    startServer(serviceWorkers)
  }
}

// process.on('error', (err) => {
//   console.log(`Error event ${JSON.stringify(err)}`)
//   process.exit(1);
// });
//
// process.on('uncaughtException', (err) => {
//   console.log(`Error event ${JSON.stringify(err)}`)
//   process.exit(1);
// });
//
// process.on('unhandledRejection', (reason, promise) => {
//   throw reason;
// })

run()
