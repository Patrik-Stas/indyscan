const winston = require('winston')
const { createLogger } = require('./logger-builder')
console.log(`log level= ${process.env.LOG_LEVEL}`)
createLogger('main', process.env.LOG_LEVEL, true, true, true)

module.exports = winston.loggers.get('main')
