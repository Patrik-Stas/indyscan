const dotenv = require('dotenv')
const Joi = require('joi')
dotenv.config()

const appConfig = {
  LOG_LEVEL: process.env.LOG_LEVEL,
  URL_MONGO: process.env.URL_MONGO,
  INDY_NETWORKS: process.env.INDY_NETWORKS,
  SCAN_MODE: process.env.SCAN_MODE
}

console.log(`Loaded configuration: ${JSON.stringify(appConfig, null, 2)}`)

const configValidation = Joi.object().keys({
  LOG_LEVEL: Joi.string().lowercase().valid(['silly', 'debug', 'info', 'warn', 'error']),
  URL_MONGO: Joi.string().uri().required(),
  INDY_NETWORKS: Joi.string().required(),
  SCAN_MODE: Joi.string().valid('SLOW', 'MEDIUM', 'INDYSCAN.IO', 'FAST', 'TURBO', 'FRENZY')
})
Joi.validate(appConfig, configValidation, (err, ok) => { if (err) throw err })

module.exports = appConfig
