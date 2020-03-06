const {createLogger, addElasticTransport} = require('./logger-builder')

console.log(`Building loggers.`)
const logger = createLogger('main', process.env.LOG_LEVEL)

const {LOG_ES_URL} = process.env

if (LOG_ES_URL) {
  addElasticTransport(logger, process.env.LOG_ES_URL, 'logs-daemon', 'debug')
} else {
  logger.warn(`ELASTICSEARCH LOGGING DISABLED. Due to: Missing LOG_ES_URL value.`)
}

module.exports = logger
