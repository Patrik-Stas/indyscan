const winston = require('winston')
const { createLogger } = require('./logger-builder')
createLogger('main', 'debug')

module.exports = winston.loggers.get('main')
