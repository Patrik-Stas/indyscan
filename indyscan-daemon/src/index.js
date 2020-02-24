const logger = require('./logging/logger-main')
const path = require('path')
const {getAppConfigPaths} = require('./config/env')
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

function loadOpTemplate (opTemplateName) {
  const template = require(`${path.dirname(__dirname)}/src/op-templates/${opTemplateName}.json`)
  if (!template) {
    throw Error(`Failed to load operational template ${opTemplateName}`)
  }
  // if (!fs.existsSync(path)) {
  //   throw Error(`Config path ${path} is not pointing to a file.`)
  // }
  return template
}

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
  workers = _.flatten(workers)
  for (const worker of workers) {
    console.log(`Starting worker ${worker.getObjectId()}`)
    worker.start()
  }

  // for (const operationDefinition of operationDefinitions) {
  //   let pipelines = await bootstrapApp(operationDefinition.objects)
  //   logger.info(`Bootstrap finished! Created ${pipelines.length} pipelines.`)
  //   for (const pipeline of pipelines) {
  //     logger.info(`Starting pipeline ${pipeline.getObjectId()}`)
  //     pipeline.start()
  //   }
  // }
}

run()
