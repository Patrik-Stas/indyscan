const { createLogger, addElasticTransport } = require('./logger-builder')

const logger = createLogger('main', process.env.LOG_LEVEL, process.env.ENABLE_LOGFILES === 'true')

const { LOG_ES_URL } = process.env

if (LOG_ES_URL) {
  addElasticTransport('main', process.env.LOG_ES_URL, 'logs-daemon', 'debug')
}

module.exports = logger
