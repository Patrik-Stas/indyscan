const logger = require('./logging/logger-main')
const Joi = require('joi')

let appConfig = {
  PORT: process.env.PORT,
  INDYSCAN_API_URL: process.env.INDYSCAN_API_URL,
  DAEMON_WS_URL: process.env.DAEMON_WS_URL,
  LOG_LEVEL: process.env.LOG_LEVEL,
  LOG_HTTP_REQUESTS: process.env.LOG_HTTP_REQUESTS,
  LOG_HTTP_RESPONSES: process.env.LOG_HTTP_RESPONSES
}

logger.info(`Loaded configuration:\n${JSON.stringify(appConfig, null, 2)}`)

const configValidation = Joi.object().keys({
  PORT: Joi.number().integer().min(1025).max(65535).required(),
  INDYSCAN_API_URL: Joi.string().uri().required(),
  DAEMON_WS_URL: Joi.string().uri(),
  LOG_LEVEL: Joi.string().valid(['trace', 'debug', 'info', 'warn', 'error']).required(),
  LOG_HTTP_REQUESTS: Joi.string().valid(['true', 'false']).required(),
  LOG_HTTP_RESPONSES: Joi.string().valid(['true', 'false']).required()
})

Joi.validate(appConfig, configValidation, (err, ok) => { if (err) throw err })

module.exports.appConfig = appConfig
