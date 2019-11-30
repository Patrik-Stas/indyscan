const logger = require('./logging/logger-main')

module.exports.logResponses = function logResponses (req, res, next) {
  var oldWrite = res.write

  var oldEnd = res.end

  var chunks = []

  res.write = function (chunk) {
    chunks.push(chunk)
    oldWrite.apply(res, arguments)
  }

  res.end = function (chunk) {
    if (!req.path.includes(['/favicon']) && !req.path.includes(['swagger-ui'])) {
      if (chunk && Buffer.isBuffer(chunk)) {
        chunks.push(chunk)
        var body = Buffer.concat(chunks).toString('utf8')
        logger.debug(`<------ Response to [${req.method}] ${req.path}:`)
        logger.debug(`<------ HTTP Code: ${res.statusCode}`)
        logger.debug(`<------ Body: ${body}`)
      }
    }
    oldEnd.apply(res, arguments)
  }
  next()
}

module.exports.logRequests = function logRequests (req, res, next) {
  logger.debug(`----> Request: [${req.method}] ${req.originalUrl}`)
  logger.debug(`----> Body: ${JSON.stringify(req.body)}`)
  next()
}
