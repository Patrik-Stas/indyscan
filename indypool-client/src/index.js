const { createIndyClient, isKnownLedger } = require('./indyclient')
const logger = require('./logging/logger-main')

// TODO: Setting up IndySKD logging here is causing seemmingly random crashes!
const indy = require('indy-sdk')
indy.setLogger(function (level, target, message, modulePath, file, line) {
  if (level === 1) {
    logger.error(`INDYSDK: ${message}`)
  } else if (level === 2) {
    logger.warn(`INDYSDK: ${message}`)
  } else if (level === 3) {
    logger.info(`INDYSDK: ${message}`)
  } else if (level === 4) {
    logger.debug(`INDYSDK: ${message}`)
  } else {
    logger.silly(`INDYSDK: ${message}`)
  }
})

async function run () {
  let { NETWORK_NAME } = process.env
  if (await isKnownLedger(NETWORK_NAME)) {
    await createIndyClient(NETWORK_NAME)
    logger.info(`FINISHED SUCCESS!`)
  } else {
    logger.info(`Unrecognized network ${NETWORK_NAME}`)
  }
}

run()
