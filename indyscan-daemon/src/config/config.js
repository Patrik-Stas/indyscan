require('dotenv').config()
const Joi = require('joi')
const fs = require('fs')
// Note: Can't refer to logging/logger-main.js otherwise we get circular dependency and corrupts either logger or config

const appConfig = {
  LOG_LEVEL: process.env.LOG_LEVEL,
  NETWORKS_CONFIG_PATH: process.env.NETWORKS_CONFIG_PATH
}

console.log(`Loaded configuration: ${JSON.stringify(appConfig, null, 2)}`)

const configValidation = Joi.object().keys({
  LOG_LEVEL: Joi.string().lowercase().valid(['silly', 'debug', 'info', 'warn', 'error']),
  NETWORKS_CONFIG_PATH: Joi.string().required()
})
Joi.validate(appConfig, configValidation, (err, ok) => { if (err) throw err })

if (!fs.existsSync(appConfig.NETWORKS_CONFIG_PATH)) {
  throw Error(`Config path ${appConfig.NETWORKS_CONFIG_PATH} is not pointing to a file.`)
}

module.exports.appConfig = appConfig
