const { appConfig, networksConfig } = require('./config')
const logger = require('./logging/logger-main')
const { processConfig } = require('./network-config-processor')
const { createTxResolve } = require('./resolvers/resolver-factory')
const { createStorageFactory } = require('./storage-factory')
const { createConsumerSequential } = require('./consumers/consumer-sequential')

// const indy = require('indy-sdk')
// indy.setLogger(function (level, target, message, modulePath, file, line) {
//   logger.debug(message)
// })

async function scanNetwork (scannerName, scanConfig, sourceConfig, targetConfig, storageFactory) {
  try {
    logger.info(`Initiating network scan for network '${scannerName}'.`)
    const {
      storageReadDomain, storageWriteDomain,
      storageReadPool, storageWritePool,
      storageReadConfig, storageWriteConfig
    } = await storageFactory.createStoragesForNetwork(targetConfig)
    let resolveTx = await createTxResolve(sourceConfig)

    logger.debug(`Creating consumers for network '${scannerName}'.`)
    const consumerDomain = await createConsumerSequential(resolveTx, storageReadDomain, storageWriteDomain, scannerName, 'domain', scanConfig)
    const consumerPool = await createConsumerSequential(resolveTx, storageReadPool, storageWritePool, scannerName, 'pool', scanConfig)
    const consumerConfig = await createConsumerSequential(resolveTx, storageReadConfig, storageWriteConfig, scannerName, 'config', scanConfig)

    logger.debug(`Starting consumers for network '${scannerName}'.`)
    consumerDomain.start()
    consumerPool.start()
    consumerConfig.start()
  } catch (err) {
    logger.error(`Something when wrong initiating scanning for network '${scannerName}'. Details:`)
    logger.error(err.message)
    logger.error(err.stack)
  }
}

async function run () {
  logger.info(`Starting using appConfig ${JSON.stringify(appConfig, null, 2)}.`)
  logger.info(`Networks to be scanned: ${JSON.stringify(networksConfig, null, 2)}.`)
  const storageFactory = await createStorageFactory()
  for (const networkConfig of networksConfig) {
    const { name, scanConfig, sourceConfig, targetConfig } = processConfig(networkConfig, appConfig.ES_URL)
    scanNetwork(name, scanConfig, sourceConfig, targetConfig, storageFactory)
  }
}

run()
