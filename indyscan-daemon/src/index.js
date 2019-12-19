const { appConfig } = require('./config/config')
const logger = require('./logging/logger-main')
const { processScanConfigFile } = require('./config/network-config-processor')
const { createTxResolve } = require('./tx-sources/tx-source-factory')
const { createStorageFactory } = require('./tx-storages/tx-storage-factory')
const { createConsumerSequential } = require('./consumers/consumer-sequential')

// const indy = require('indy-sdk')
// indy.setLogger(function (level, target, message, modulePath, file, line) {
//   logger.debug(message)
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
