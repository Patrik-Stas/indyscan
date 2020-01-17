const winston = require('winston')
const { createLogger } = require('./logger-builder')
createLogger('main', process.env.LOG_LEVEL, true, true, true)

module.exports = winston.loggers.get('main')
