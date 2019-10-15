const winston = require('winston')
const { createLogger } = require('./logger-builder')
const appConfig = require('../config')
createLogger('main', appConfig.LOG_LEVEL)

module.exports = winston.loggers.get('main')
