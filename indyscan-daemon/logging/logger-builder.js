const winston = require('winston')

module.exports.createLogger = function createLogger (mainLoggerName, consoleLogsLevel = 'warn') {
  const prettyFormatter = winston.format.combine(
    winston.format.printf(
      info => `${info.timestamp} [${info.level}]: ${info.message}`
    )
  )

  winston.loggers.add(mainLoggerName, {
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      })
    ),
    transports: [
      new winston.transports.Console({
        level: consoleLogsLevel,
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          prettyFormatter
        )
      })
    ]
  })
}
