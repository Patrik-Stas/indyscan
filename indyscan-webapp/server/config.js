const logger = require('./logging/logger-main')
const fs = require('fs')
const Joi = require('joi')

function loadNetworkConfigs (configPath) {
  const configData = fs.readFileSync(configPath)
  const networkConfigs = JSON.parse(configData)
  if (networkConfigs.length === 0) {
    throw Error('At least 1 network must be present in network configurations file.')
  }
  logger.info(`Loaded network config: ${JSON.stringify(networkConfigs)}`)
  return networkConfigs
}

let appConfig = {
  ES_URL: process.env.ES_URL,
  PORT: process.env.PORT,
  NETWORKS_CONFIG_PATH: process.env.NETWORKS_CONFIG_PATH,
  LOG_LEVEL: process.env.LOG_LEVEL,
  LOG_HTTP_REQUESTS: process.env.LOG_HTTP_REQUESTS,
  LOG_HTTP_RESPONSES: process.env.LOG_HTTP_RESPONSES,
}

logger.info(`Loaded configuration:\n${JSON.stringify(appConfig, null, 2)}`)

const configValidation = Joi.object().keys({
  PORT: Joi.number().integer().min(1025).max(65535).required(),
  NETWORKS_CONFIG_PATH: Joi.string().required(),
  ES_URL: Joi.string().uri().required(),
  LOG_LEVEL: Joi.string().valid(['trace', 'debug', 'info', 'warn', 'error']).required(),
  LOG_HTTP_REQUESTS: Joi.string().valid(['true', 'false']).required(),
  LOG_HTTP_RESPONSES: Joi.string().valid(['true', 'false']).required(),
})

Joi.validate(appConfig, configValidation, (err, ok) => { if (err) throw err })

if (!fs.existsSync(appConfig.NETWORKS_CONFIG_PATH)) {
  throw Error(`Config path ${appConfig.NETWORKS_CONFIG_PATH} is not pointing to a file.`)
}

const networksConfig = loadNetworkConfigs(appConfig.NETWORKS_CONFIG_PATH)
logger.info(`Loaded network configurations:\n${JSON.stringify(networksConfig, null, 2)}`)

module.exports.appConfig = appConfig
module.exports.networksConfig = networksConfig
