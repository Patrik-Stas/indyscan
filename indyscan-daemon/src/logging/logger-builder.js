const winston = require('winston')
const Elasticsearch = require('winston-elasticsearch')
const { format } = require('winston')
const { timestamp, printf } = format

function createLogger (loggerName, consoleLogsLevel = 'warn') {
  const myFormat = printf(({ level, message, timestamp, metadaemon }) => {
    return `${timestamp} [${metadaemon && metadaemon.componentId ? metadaemon.componentId : '--'}] ${level}: ${message}`
  })

  winston.loggers.add(loggerName, {
    transports: [
      new winston.transports.Console({
        level: consoleLogsLevel,
        format: winston.format.combine(
          timestamp(),
          myFormat,
          winston.format.colorize({ all: true })
        )
      })
    ]
  })
  return winston.loggers.get(loggerName)
}

function addElasticTransport (logger, loggingUrl, indexPrefix, logLevel) {
  console.log(`Adding ELASTICSEARCH LOGGING TRANSPORT... Url: ${loggingUrl}, indexPrefix: ${indexPrefix}, logLevel ${logLevel}`)
  const esTransport = new Elasticsearch({
    indexPrefix,
    ensureMappingTemplate: true,
    mappingTemplate: {
      'index_patterns': `${indexPrefix}-*`,
      'settings': {
        'number_of_shards': 1,
        'number_of_replicas': 0,
        'index': {
          'refresh_interval': '5s'
        }
      },
      'mappings': {
        '_source': { 'enabled': true },
        'properties': {
          '@timestamp': { 'type': 'date' },
          '@version': { 'type': 'keyword' },
          'environment': { 'type': 'keyword', 'index': true },
          'severity': { 'type': 'keyword', 'index': true },
          'message': { 'type': 'text', 'index': true },
          'fields': {
            'properties': {
              'metadaemon': {
                'properties': {
                  "indyNetworkId": { 'type': 'keyword', 'index': true },
                  'operationId': { 'type': 'keyword', 'index': true },
                  'componentId': { 'type': 'keyword', 'index': true },
                  'componentType': { 'type': 'keyword', 'index': true },
                  'workerRtwOutputFormat': { 'type': 'keyword', 'index': true }
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
