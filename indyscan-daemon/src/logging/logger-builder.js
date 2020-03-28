const winston = require('winston')
const mkdirp = require('mkdirp')
const Elasticsearch = require('winston-elasticsearch')
const { format } = require('winston')
const { timestamp, printf } = format

const myFormat = printf(({ level, message, timestamp, metadaemon }) => {
  return `${timestamp} [${metadaemon && metadaemon.workerId ? metadaemon.workerId : '--'}] ${level}: ${message}`
})

function createLogger (loggerName, consoleLogsLevel = 'warn') {
  winston.loggers.add(loggerName, {
    transports: [
      new winston.transports.Console({
        level: consoleLogsLevel,
        label: loggerName,
        format: winston.format.combine(
          timestamp(),
          myFormat,
          winston.format.colorize({ all: true })
        )
      })
    ]
  })
  addFileTransport(loggerName)
  return winston.loggers.get(loggerName)
}

function addFileTransport(loggerName) {
  const logDirectory = './logs'
  let logger = winston.loggers.get(loggerName)
    mkdirp(`${logDirectory}`, function (err) {
      if (err) {
        console.log(`Failed creating logs directory ${basePath}`)
        console.error(err)
      } else {
        logger.add(new winston.transports.File({
          filename: `${logDirectory}/error/${loggerName}.log`,
          label: loggerName,
          level: 'error',
          format: winston.format.combine(
            timestamp(),
            myFormat,
            winston.format.colorize({ all: true })
          )
        }))
        logger.add(new winston.transports.File({
          filename: `${logDirectory}/warn/${loggerName}.log`,
          label: loggerName,
          level: 'warn',
          format: winston.format.combine(
            timestamp(),
            myFormat,
            winston.format.colorize({ all: true })
          )
        }))
        logger.add(new winston.transports.File({
          filename: `${logDirectory}/info/${loggerName}.log`,
          label: loggerName,
          level: 'info',
          format: winston.format.combine(
            timestamp(),
            myFormat,
            winston.format.colorize({ all: true })
          )
        }))
        logger.add(new winston.transports.File({
          filename: `${logDirectory}/debug/${loggerName}.log`,
          label: loggerName,
          level: 'debug',
          format: winston.format.combine(
            timestamp(),
            myFormat,
            winston.format.colorize({ all: true })
          )
        }))
      }
    })
}

function addElasticTransport (logger, loggingUrl, indexPrefix, logLevel) {
  console.log(`Adding ELASTICSEARCH LOGGING TRANSPORT... Url: ${loggingUrl}, indexPrefix: ${indexPrefix}, logLevel ${logLevel}`)
  const esTransport = new Elasticsearch({
    indexPrefix,
    ensureMappingTemplate: true,
    mappingTemplate: {
      index_patterns: `${indexPrefix}-*`,
      settings: {
        number_of_shards: 1,
        number_of_replicas: 0,
        index: {
          refresh_interval: '5s'
        }
      },
      mappings: {
        _source: { enabled: true },
        properties: {
          '@timestamp': { type: 'date' },
          '@version': { type: 'keyword' },
          environment: { type: 'keyword', index: true },
          severity: { type: 'keyword', index: true },
          message: { type: 'text', index: true },
          fields: {
            properties: {
              metadaemon: {
                properties: {
                  indyNetworkId: { type: 'keyword', index: true },
                  operationType: { type: 'keyword', index: true },
                  workerId: { type: 'keyword', index: true },
                  componentType: { type: 'keyword', index: true },
                  workerRtwOutputFormat: { type: 'keyword', index: true }
                }
              }
            }
          }
        }
      }
    },
    flushInterval: 1,
    level: logLevel,
    buffering: true,
    clientOpts: {
      node: loggingUrl
    }
  }
  )
  logger.add(esTransport)
}

module.exports.createLogger = createLogger
module.exports.addElasticTransport = addElasticTransport
