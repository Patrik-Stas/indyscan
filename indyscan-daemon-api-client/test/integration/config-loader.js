const path = require('path')
const dotenv = require('dotenv')

module.exports.loadEnvVariables = function loadEnvVariables () {
  const env = process.env.ENVIRONMENT || 'localhost'
  const pathToConfig = path.resolve(__dirname, `../config/${env}.env`)
  dotenv.config({ path: pathToConfig })
}

module.exports.loadAuth = function loadAuth () {
  let basicAuth = {
    username: process.env.BASIC_AUTH_ENV_USERNAME,
    password: process.env.BASIC_AUTH_ENV_PASSWORD
  }
  if ((!basicAuth.password) || (!basicAuth.username)) {
    basicAuth = null
  }
  return basicAuth
}
