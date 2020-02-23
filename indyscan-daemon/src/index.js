const { envConfig, getAppConfigNames, getAppConfigMap } = require('./config/env')
const logger = require('./logging/logger-main')
const {getAppConfig} = require('./config/env')
const { bootstrapApp } = require('./ioc')
const { appConfigToObjectsConfig } = require('./config/network-config-processor')
const { loadAppConfigFromFile } = require('./config/network-config-processor')
const Mustache = require('mustache')
const path = require('path')
const fs = require('fs')

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

function loadOpTemplate(opTemplateName) {
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
  const appConfigNames = getAppConfigNames()
  for (const appConfigName of appConfigNames) {
    const appConfig = getAppConfig(appConfigName)
    console.log(`App config ${appConfigName}`)
    console.log(JSON.stringify(appConfig))
    for (const operationName of appConfig.operations) {
      const operationTemplate = loadOpTemplate(operationName)
      const mustacheView = appConfig.view
      var output = Mustache.render(JSON.stringify(operationTemplate, null, 2), mustacheView);
    }
  }

  console.log(JSON.stringify(getAppConfigNames(), null, 2))
  console.log(JSON.stringify(getAppConfigMap(), null, 2))

  // const appConfig = await loadAppConfigFromFile(envConfig.NETWORKS_CONFIG_PATH)
  // logger.info(`Loaded app confing ${JSON.stringify(appConfig, null, 2)}.`)
  // const objectsConfig = appConfigToObjectsConfig(appConfig)
  // logger.info(`Created objects config: ${JSON.stringify(objectsConfig, null, 2)}.`)
  // let pipelines = await bootstrapApp(objectsConfig)
  // logger.info(`Bootstrap finished! Created ${pipelines.length} pipelines.`)
  // for (const pipeline of pipelines) {
  //   logger.info(`Starting pipeline ${pipeline.getObjectId()}`)
  //   pipeline.start()
  // }
}

run()
