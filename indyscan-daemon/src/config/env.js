require('dotenv').config()
const Joi = require('joi')
const fs = require('fs')
// Note: Can't refer to logging/logger-main.js otherwise we get circular dependency and corrupts either logger or config

const envConfig = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  WORKER_CONFIGS: process.env.WORKER_CONFIGS,
  SERVER_ENABLED: process.env.SERVER_ENABLED,
  LOG_HTTP_REQUESTS: process.env.LOG_HTTP_REQUESTS,
  LOG_HTTP_RESPONSES: process.env.LOG_HTTP_RESPONSES,
  SERVER_PORT: process.env.SERVER_PORT,
  AUTOSTART: process.env.AUTOSTART
}

console.log(`Loaded configuration: ${JSON.stringify(envConfig, null, 2)}`)

const configValidation = Joi.object().keys({
  LOG_LEVEL: Joi.string().lowercase().valid(['silly', 'debug', 'info', 'warn', 'error']),
  WORKER_CONFIGS: Joi.string().required(),
  SERVER_ENABLED: Joi.string().valid(['true', 'false']),
  LOG_HTTP_REQUESTS: Joi.string().valid(['true', 'false']),
  LOG_HTTP_RESPONSES: Joi.string().valid(['true', 'false']),
  SERVER_PORT: Joi.number().integer().min(1025).max(65535),
  AUTOSTART: Joi.string().valid(['true', 'false'])
})
Joi.validate(envConfig, configValidation, (err, ok) => { if (err) throw err })

envConfig.SERVER_ENABLED = envConfig.SERVER_ENABLED === 'true'
envConfig.AUTOSTART = envConfig.AUTOSTART === 'true'

const workerConfigPaths = envConfig.WORKER_CONFIGS.split(',')
for (const path of workerConfigPaths) {
  if (!fs.existsSync(path)) {
    throw Error(`Config path ${path} is not pointing to a file.`)
  }
}

function getWorkerConfigPaths () {
  return workerConfigPaths
}

module.exports.envConfig = envConfig
module.exports.getWorkerConfigPaths = getWorkerConfigPaths
