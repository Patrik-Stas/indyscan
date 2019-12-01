const { createStorageFactory } = require('./storage-factory')
const appConfig = require('./config')
const { createConsumerSequential } = require('./consumers/consumer-sequential')
const { createTxEmitter } = require('./tx-emitter')
const { createTxResolverLedger } = require('./resolvers/ledger-resolver')
const logger = require('./logging/logger-main')
const networks = appConfig.INDY_NETWORKS.split(',')

// const indy = require('indy-sdk')
// indy.setLogger(function (level, target, message, modulePath, file, line) {
//   logger.debug(message)
// })

const scanModes = {
  'SLOW': { periodMs: 30 * 1000, unavailableTimeoutMs: 30 * 1000, jitterRatio: 0.1 },
  'MEDIUM': { periodMs: 10 * 1000, unavailableTimeoutMs: 20 * 1000, jitterRatio: 0.1 },
  'INDYSCAN.IO': { periodMs: 3 * 1000, unavailableTimeoutMs: 5 * 1000, jitterRatio: 0.1 },
  'FAST': { periodMs: 1000, unavailableTimeoutMs: 2 * 1000, jitterRatio: 0.1 },
  'TURBO': { periodMs: 300, unavailableTimeoutMs: 1000, jitterRatio: 0.1 },
  'FRENZY': { periodMs: 300, unavailableTimeoutMs: 300, jitterRatio: 0.1 }
}

async function scanNetwork (networkName, storageFactory) {
  try {
    logger.info(`Initiating network scan for network '${networkName}'.`)
    const { storageDomain, storagePool, storageConfig } = await storageFactory.createStoragesForNetwork(networkName)
    const resolveTx = await createTxResolverLedger(networkName)

    logger.debug(`Creating consumers for network '${networkName}'.`)
    const consumerDomain = await createConsumerSequential(resolveTx, storageDomain, networkName, 'domain', scanModes[appConfig.SCAN_MODE])
    const consumerPool = await createConsumerSequential(resolveTx, storagePool, networkName, 'pool', scanModes[appConfig.SCAN_MODE])
    const consumerConfig = await createConsumerSequential(resolveTx, storageConfig, networkName, 'config', scanModes[appConfig.SCAN_MODE])

    logger.debug(`Starting consumers for network '${networkName}'.`)
    consumerDomain.start()
    consumerPool.start()
    consumerConfig.start()
  } catch (err) {
    logger.error(`Something when wrong initiating scanning for network '${networkName}'. Details:`)
    logger.error(err.message)
    logger.error(err.stack)
  }
}

async function run () {
  logger.info(`Starting. Networks to be scanned: ${JSON.stringify(networks)}`)
  const storageFactory = await createStorageFactory()
  for (const indyNetwork of networks) {
    scanNetwork(indyNetwork, storageFactory)
  }
}

run()
