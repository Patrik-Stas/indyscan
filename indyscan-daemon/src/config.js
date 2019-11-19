const dotenv = require('dotenv')
const Joi = require('joi')
dotenv.config()

const appConfig = {
  LOG_LEVEL: process.env.LOG_LEVEL,
  URL_MONGO: process.env.URL_MONGO,
  USE_STORAGE: process.env.USE_STORAGE,
  INDY_NETWORKS: process.env.INDY_NETWORKS,
  SCAN_MODE: process.env.SCAN_MODE,
  ES_URL: process.env.ES_URL,
  ES_REPLICA_COUNT: process.env.ES_REPLICA_COUNT
}

console.log(`Loaded configuration: ${JSON.stringify(appConfig, null, 2)}`)

const configValidation = Joi.object().keys({
  LOG_LEVEL: Joi.string().lowercase().valid(['silly', 'debug', 'info', 'warn', 'error']),
  URL_MONGO: Joi.string().uri(),
  ES_URL: Joi.string().uri(),
  USE_STORAGE: Joi.string().valid('ELASTIC_SEARCH', 'MONGO').required(),
  INDY_NETWORKS: Joi.string().required(),
  ES_REPLICA_COUNT: Joi.number().integer().min(0).required(),
  SCAN_MODE: Joi.string().valid('SLOW', 'MEDIUM', 'INDYSCAN.IO', 'FAST', 'TURBO', 'FRENZY')
})
Joi.validate(appConfig, configValidation, (err, ok) => { if (err) throw err })

if (appConfig.USE_STORAGE === 'ELASTIC_SEARCH') {
  if (!appConfig.ES_URL) {
    throw Error(`ElasticSearch storage used, but ES_URL was not provided.`)
  }
} else if (appConfig.USE_STORAGE === 'MONGO') {
  if (!appConfig.URL_MONGO) {
    throw Error(`ElasticSearch storage used, but URL_MONGO was not provided.`)
  }
}

module.exports = appConfig
