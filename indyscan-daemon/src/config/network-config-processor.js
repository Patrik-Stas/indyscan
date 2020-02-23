const path = require('path')
const fs = require('fs')
const logger = require('../logging/logger-main')

async function loadAppConfigFromFile (scanConfigsPath) {
  const appConfigString = fs.readFileSync(scanConfigsPath)
  const appConfig = JSON.parse(appConfigString)
  const { environment, objects } = appConfig
  logger.debug(`Loaded app config from ${scanConfigsPath}.\n` +
    `Parsed object environment: ${JSON.stringify(environment, null, 2)}\n` +
    `Parsed app objects: ${JSON.stringify(objects, null, 2)}`)
  environment.CFGDIR = path.dirname(scanConfigsPath)
  return { environment, objects }
}

function appConfigToObjectsConfig (rawAppConfig) {
  const { environment, objects } = rawAppConfig
  let strObjects = JSON.stringify(objects)
  for (const [key, value] of Object.entries(environment)) {
    // TODO: How can we use actual environment variables to interpolate object configurations
    // TODO: Adjust standard operation configuration to start 3 pipelines for serializer processor
    // TODO: have integration test that 2 pipelines (wwith different processor) operate independently and the data is mereged in ES.
    let finalValue = process.env[key] ? process.env[key] : value
    if (finalValue !== value) {
      logger.debug(`App config variable ${key} was overriden to have value ${finalValue} via supplied environment variable in runtime.`)
    }
    strObjects = strObjects.split(`$${key}`).join(finalValue)
  }
  return JSON.parse(strObjects)
}

module.exports.loadAppConfigFromFile = loadAppConfigFromFile
module.exports.appConfigToObjectsConfig = appConfigToObjectsConfig
