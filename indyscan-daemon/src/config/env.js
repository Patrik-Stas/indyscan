require('dotenv').config()
const Joi = require('joi')
const fs = require('fs')
const path = require('path')
// Note: Can't refer to logging/logger-main.js otherwise we get circular dependency and corrupts either logger or config

const envConfig = {
  LOG_LEVEL: process.env.LOG_LEVEL,
  APP_CONFIGS_DIR: process.env.APP_CONFIGS_DIR || path.join(__dirname, '../../app-configs'),
  APP_CONFIGS: process.env.APP_CONFIGS
}

console.log(`Loaded configuration: ${JSON.stringify(envConfig, null, 2)}`)

const configValidation = Joi.object().keys({
  LOG_LEVEL: Joi.string().lowercase().valid(['silly', 'debug', 'info', 'warn', 'error']),
  APP_CONFIGS_DIR: Joi.string().required(),
  APP_CONFIGS: Joi.string()
})
Joi.validate(envConfig, configValidation, (err, ok) => { if (err) throw err })

// if (!fs.existsSync(envConfig.APP_CONFIGS_DIR)) {
//   throw Error(`Config path ${envConfig.APP_CONFIGS_DIR} is not pointing to a file.`)
// }

const appConfigNames = envConfig.APP_CONFIGS.split(',')
const appConfigMap = {}
for (const appConfigName of appConfigNames) {
  const path = `${envConfig.APP_CONFIGS_DIR}/${appConfigName}.js`
  if (!fs.existsSync(path)) {
    throw Error(`Config path ${path} is not pointing to a file.`)
  }
  appConfigMap[appConfigName] = require(path)
}


function getAppConfigNames() {
  return appConfigNames
}

function getAppConfigMap() {
  return appConfigMap
}

module.exports.envConfig = envConfig
module.exports.getAppConfigNames = getAppConfigNames
module.exports.getAppConfigMap = getAppConfigMap
