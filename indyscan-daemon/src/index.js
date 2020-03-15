const { envConfig } = require('./config/env')
const logger = require('./logging/logger-main')
const _ = require('lodash')
const sleep = require('sleep-promise')
const util = require('util')
const { startServer } = require('./server/server')
const { createServiceWorkers } = require('./service/service-workers')
const Mustache = require('mustache')
const { getWorkerConfigPaths } = require('./config/env')
const fs = require('fs')
const path = require('path')
const { createNetOpRtwExpansion } = require('./worker-templates/rtw-db-expansion')
const { createNetOpRtwSerialization } = require('./worker-templates/rtw-ledger-to-serialized')
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

async function buildWorkers (builder, builderParams) {
  logger.info(`Going to build workers by ${builder} from ${JSON.stringify(builderParams)}`)
  if (builder === 'rtwSerialization') {
    return createNetOpRtwSerialization(builderParams)
  } else if (builder === 'rtwExpansion') {
    return createNetOpRtwExpansion(builderParams)
  } else {
    throw Error(`Unknown builder type ${builder}`)
  }
}

async function run () {
  const serviceWorkers = createServiceWorkers()
  if (envConfig.SERVER_ENABLED) {
    startServer(serviceWorkers)
  }
  let workers = []
  try {
    const workerConfigPaths = getWorkerConfigPaths()
    await sleep(2000)
    logger.info(`Will bootstrap app from following operations definitions ${JSON.stringify(workerConfigPaths, null, 2)}`)

    for (const workerConfigPath of workerConfigPaths) {
      const workersConfig = fs.readFileSync(workerConfigPath)
      const { workersBuildersTemplate, env } = JSON.parse(workersConfig)
      env.cfgdir = path.dirname(workerConfigPath)
      const workerBuilders = JSON.parse(Mustache.render(JSON.stringify(workersBuildersTemplate), env))
      for (const workerBuilder of workerBuilders) {
        const { builder, params } = workerBuilder
        const workerGroup = await buildWorkers(builder, params)
        workers.push(workerGroup)
      }
    }
  } catch (e) {
    console.error(util.inspect(e))
    return
  }
  workers = _.flatten(workers)
  logger.info(`Built all workers. Workers total ${workers.length}`)
  for (const worker of workers) {
    serviceWorkers.registerWorker(worker)
  }

  if (envConfig.AUTOSTART) {
    logger.info('Autostarting all workers.')
    const workers = serviceWorkers.getAllWorkers()
    for (const worker of workers) {
      worker.enable()
    }
  } else {
    logger.info('Worker autostart is disabled.')
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
