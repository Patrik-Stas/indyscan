const path = require('path')
const fs = require('fs')

async function loadAppConfigFromFile (scanConfigsPath) {
  const appConfigString = fs.readFileSync(configPath)
  const appConfig = JSON.parse(appConfigString)
  const {environment, objects} = appConfig
  environment.CFGDIR = path.dirname(scanConfigsPath)
  return {environment, objects}
}

async function appConfigToObjectsConfig (rawAppConfig) {
  const {environment, objects} = rawAppConfig
  let strObjects = JSON.stringify(objects)
  for (const [key, value] of Object.entries(environment)) {
    strObjects = strObjects.split(key).join(value)
  }
  return JSON.parse(strObjects)
}

module.exports.loadAppConfigFromFile = loadAppConfigFromFile
module.exports.appConfigToObjectsConfig = appConfigToObjectsConfig
