const { createLogger } = require('./logger-builder')
const winston = require('winston')

console.log(`Logger file`)
createLogger('main', process.env.LOG_LEVEL, true, true, true)
const logger = winston.loggers.get('main')
logger.error(`Winston logger test: error.`)
logger.warn(`Winston logger test: warn.`)
logger.info(`Winston logger test: info.`)
logger.debug(`Winston logger test: debug.`)
logger.silly(`Winston logger test: silly.`)

module.exports = logger
