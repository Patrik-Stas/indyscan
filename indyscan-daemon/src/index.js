const { envConfig } = require('./config/env')
const logger = require('./logging/logger-main')
const {bootstrapApp} = require('./ioc')
const {appConfigToObjectsConfig} = require('./config/network-config-processor')
const {loadAppConfigFromFile} = require('./config/network-config-processor')
const { processScanConfigFile } = require('./config/network-config-processor')

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

// async function scanNetwork (scannerName, consumerConfig, sourceConfig, storageConfig, storageFactory) {
//   try {
//     logger.info(`Initiating network scan for network '${scannerName}'.`)
//     const {
//       storageReadDomain, storageWriteDomain,
//       storageReadPool, storageWritePool,
//       storageReadConfig, storageWriteConfig
//     } = await storageFactory.createStoragesForNetwork(storageConfig)
//     let resolveTx = await createTxResolve(sourceConfig)
//
//     logger.debug(`Creating consumers for network '${scannerName}'.`)
//     const consumerDomainSubledger = await createConsumerSequential(resolveTx, storageReadDomain, storageWriteDomain, scannerName, 'domain', consumerConfig.data)
//     const consumerPoolSubledger = await createConsumerSequential(resolveTx, storageReadPool, storageWritePool, scannerName, 'pool', consumerConfig.data)
//     const consumerConfigSubledger = await createConsumerSequential(resolveTx, storageReadConfig, storageWriteConfig, scannerName, 'config', consumerConfig.data)
//
//     logger.debug(`Starting consumers for network '${scannerName}'.`)
//     consumerDomainSubledger.start()
//     consumerPoolSubledger.start()
//     consumerConfigSubledger.start()
//   } catch (err) {
//     logger.error(`Something when wrong initiating scanning for network '${scannerName}'. Details:`)
//     logger.error(err.message)
//     logger.error(err.stack)
//   }
// }

async function run () {
  const appConfig = await loadAppConfigFromFile(envConfig.NETWORKS_CONFIG_PATH)
  logger.info(`Loaded app confing ${JSON.stringify(appConfig, null, 2)}.`)
  const objectsConfig = appConfigToObjectsConfig(appConfig)
  logger.info(`Created objects config: ${JSON.stringify(objectsConfig, null, 2)}.`)
  let pipelines = await bootstrapApp(objectsConfig)
  logger.info(`Bootstrap finished! Create ${pipelines.length()} pipelines.`)

}

run()
