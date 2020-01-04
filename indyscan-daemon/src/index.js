const { appConfig } = require('./config/config')
const logger = require('./logging/logger-main')
const { processScanConfigFile } = require('./config/network-config-processor')
const { createTxResolve } = require('./tx-sources/tx-source-factory')
const { createStorageFactory } = require('./tx-storages/tx-storage-factory')
const { createConsumerSequential } = require('./consumers/consumer-sequential')

// TODO: Setting up IndySKD logging here is causing seemmingly random crashes!
// const indy = require('indy-sdk')
// indy.setLogger(function (level, target, message, modulePath, file, line) {
//   if (level === 1) {
//     logger.error(`INDYSDK: ${message}`)
//   } else if (level === 2) {
//     logger.warn(`INDYSDK: ${message}`)
//   } else if (level === 3) {
//     logger.info(`INDYSDK: ${message}`)
//   } else if (level === 4) {
//     logger.debug(`INDYSDK: ${message}`)
//   } else {
//     logger.silly(`INDYSDK: ${message}`)
//   }
// })

async function scanNetwork (scannerName, consumerConfig, sourceConfig, storageConfig, storageFactory) {
  try {
    logger.info(`Initiating network scan for network '${scannerName}'.`)
    const {
      storageReadDomain, storageWriteDomain,
      storageReadPool, storageWritePool,
      storageReadConfig, storageWriteConfig
    } = await storageFactory.createStoragesForNetwork(storageConfig)
    let resolveTx = await createTxResolve(sourceConfig)

    logger.debug(`Creating consumers for network '${scannerName}'.`)
    const consumerDomainSubledger = await createConsumerSequential(resolveTx, storageReadDomain, storageWriteDomain, scannerName, 'domain', consumerConfig.data)
    const consumerPoolSubledger = await createConsumerSequential(resolveTx, storageReadPool, storageWritePool, scannerName, 'pool', consumerConfig.data)
    const consumerConfigSubledger = await createConsumerSequential(resolveTx, storageReadConfig, storageWriteConfig, scannerName, 'config', consumerConfig.data)

    logger.debug(`Starting consumers for network '${scannerName}'.`)
    consumerDomainSubledger.start()
    consumerPoolSubledger.start()
    consumerConfigSubledger.start()
  } catch (err) {
    logger.error(`Something when wrong initiating scanning for network '${scannerName}'. Details:`)
    logger.error(err.message)
    logger.error(err.stack)
  }
}

async function run () {

  logger.info(`Starting using appConfig ${JSON.stringify(appConfig, null, 2)}.`)
  const storageFactory = await createStorageFactory()
  const scanConfigs = await processScanConfigFile(appConfig.NETWORKS_CONFIG_PATH)
  logger.info(`Loaded and processed scan config file ${appConfig.NETWORKS_CONFIG_PATH}. ` +
    ` Final scan configuration: ${JSON.stringify(scanConfigs, null, 2)}`)
  for (const scanConfig of scanConfigs) {
    // logger.info(JSON.stringify(scanConfig.sourceConfig))
    const { name, consumerConfig, sourceConfig, storageConfig } = scanConfig
    logger.info(JSON.stringify(consumerConfig))
    scanNetwork(name, consumerConfig, sourceConfig, storageConfig, storageFactory)
  }
}

run()
