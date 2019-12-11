require('dotenv').config()
const Joi = require('joi')
const fs = require('fs')
// Note: Can't refer to logging/logger-main.js otherwise we get circular dependency and corrupts either logger or config

function loadNetworkConfigs (configPath) {
  const configData = fs.readFileSync(configPath)
  const networkConfigs = JSON.parse(configData)
  if (networkConfigs.length === 0) {
    throw Error('At least 1 network must be present in network configurations file.')
  }
  console.log(`Loaded network config: ${JSON.stringify(networkConfigs)}`)
  return networkConfigs
}

const appConfig = {
  LOG_LEVEL: process.env.LOG_LEVEL,
  URL_MONGO: process.env.URL_MONGO,
  NETWORKS_CONFIG_PATH: process.env.NETWORKS_CONFIG_PATH,
  ES_URL: process.env.ES_URL,
  ES_REPLICA_COUNT: process.env.ES_REPLICA_COUNT
}

console.log(`Loaded configuration: ${JSON.stringify(appConfig, null, 2)}`)

const configValidation = Joi.object().keys({
  LOG_LEVEL: Joi.string().lowercase().valid(['silly', 'debug', 'info', 'warn', 'error']),
  URL_MONGO: Joi.string().uri(),
  NETWORKS_CONFIG_PATH: Joi.string().required(),
  ES_URL: Joi.string().uri(),
  ES_REPLICA_COUNT: Joi.number().integer().min(0).required()
})
Joi.validate(appConfig, configValidation, (err, ok) => { if (err) throw err })

if (!fs.existsSync(appConfig.NETWORKS_CONFIG_PATH)) {
  throw Error(`Config path ${appConfig.NETWORKS_CONFIG_PATH} is not pointing to a file.`)
}

const networksConfig = loadNetworkConfigs(appConfig.NETWORKS_CONFIG_PATH)
console.log(`Loaded network configurations:\n${JSON.stringify(networksConfig, null, 2)}`)

module.exports.appConfig = appConfig
module.exports.networksConfig = networksConfig
