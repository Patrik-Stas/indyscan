const { createStorageMongo, createMongoCollection } = require('indyscan-storage')

const { MongoClient } = require('mongodb')
const util = require('util')
const { createConsumerSequential } = require('./consumers/consumer-sequential')
const { createTxEmitter } = require('./tx-emitter')
const { createTxResolverLedger } = require('./resolvers/ledger-resolver')

const logger = require('./logging/logger-main')
const URL_MONGO = process.env.URL_MONGO || 'mongodb://localhost:27017'
const INDY_NETWORKS = process.env.INDY_NETWORKS

const networks = INDY_NETWORKS.split(',')

const scanModes = {
  'SLOW': { periodMs: 30 * 1000, unavailableTimeoutMs: 30 * 1000, jitterRatio: 0.1 },
  'MEDIUM': { periodMs: 10 * 1000, unavailableTimeoutMs: 20 * 1000, jitterRatio: 0.1 },
  'INDYSCAN.IO': { periodMs: 3 * 1000, unavailableTimeoutMs: 5 * 1000, jitterRatio: 0.1 },
  'FAST': { periodMs: 1000, unavailableTimeoutMs: 2 * 1000, jitterRatio: 0.1 },
  'TURBO': { periodMs: 300, unavailableTimeoutMs: 1000, jitterRatio: 0.1 },
  'FRENZY': { periodMs: 300, unavailableTimeoutMs: 300, jitterRatio: 0.1 }
}

const SCAN_MODE = process.env.SCAN_MODE || 'SLOW'

const asyncMongoConnect = util.promisify(MongoClient.connect)

async function run () {
  logger.info(`Starting daemon...`)
  const mongoHost = await asyncMongoConnect(URL_MONGO)
  console.log(`Connected to Mongo '${URL_MONGO}'.`)
  logger.info(`Following networks will be scanned ${JSON.stringify(networks)}`)
  const resolveTxOnLedger = await createTxResolverLedger(networks)
  for (const indyNetwork of networks) {
    await scanNetwork(resolveTxOnLedger, indyNetwork, mongoHost)
  }
}

async function scanNetwork (resolveTx, networkName, mongoHost) {
  logger.info(`Initiating network scan for network '${networkName}'.`)
  try {
    logger.debug(`Creating tx emitter for network '${networkName}'`)
    const txEmitter = await createTxEmitter(networkName, resolveTx)
    logger.debug(`Creating mongo database for network '${networkName}'.`)
    let mongoDb = await mongoHost.db(networkName)
    logger.debug(`Creating mongo storages for network '${networkName}'.`)
    const storageDomain = await createStorageMongo(await createMongoCollection(mongoDb, 'txs-domain'))
    const storagePool = await createStorageMongo(await createMongoCollection(mongoDb, 'txs-pool'))
    const storageConfig = await createStorageMongo(await createMongoCollection(mongoDb, 'txs-config'))
    logger.debug(`Creating consumers for network '${networkName}'.`)
    const consumerDomain = await createConsumerSequential(txEmitter, storageDomain, networkName, 'domain', scanModes[SCAN_MODE])
    const consumerPool = await createConsumerSequential(txEmitter, storagePool, networkName, 'pool', scanModes[SCAN_MODE])
    const consumerConfig = await createConsumerSequential(txEmitter, storageConfig, networkName, 'config', scanModes[SCAN_MODE])
    logger.debug(`Starting consumers for network '${networkName}'.`)
    consumerDomain.start()
    consumerPool.start()
    consumerConfig.start()
  } catch (err) {
    logger.error(`Something when wrong creating indy client for network '${networkName}'. Details:`)
    logger.error(err)
    logger.error(err.stack)
  }
}

run()
