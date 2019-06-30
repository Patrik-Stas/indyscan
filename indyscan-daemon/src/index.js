import { createConsumerMongo } from './consumers/consumer-mongo'
import { createTxEmitter } from './tx-emitter'
import { createTxResolverLedger } from './resolvers/ledger-resolver'
import { createTimerLock } from './scan-timer'
const util = require('util')

const storage = require('indyscan-storage')

const logger = require('./logging/logger-main')
const { MongoClient } = require('mongodb')
const URL_MONGO = process.env.URL_MONGO || 'mongodb://localhost:27017'
const INDY_NETWORKS = process.env.INDY_NETWORKS

// const INITIAL_SCAN_DELAY_MS = process.env.INITIAL_SCAN_DELAY_MS || 1000

const networks = INDY_NETWORKS.split(',')

const scanModes = {
  'SLOW': { frequencySec: 30, unavailableExtraTimeout: 30, jitterRatio: 0.1 },
  'MEDIUM': { frequencySec: 10, unavailableExtraTimeout: 20, jitterRatio: 0.1 },
  'INDYSCAN.IO': { frequencySec: 3, unavailableExtraTimeout: 5, jitterRatio: 0.1 },
  'FAST': { frequencySec: 1, unavailableExtraTimeout: 2, jitterRatio: 0.1 },
  'TURBO': { frequencySec: 0.3, unavailableExtraTimeout: 1, jitterRatio: 0.1 },
  'FRENZY': { frequencySec: 0.3, unavailableExtraTimeout: 0.3, jitterRatio: 0.1 },
}

const SCAN_MODE = process.env.SCAN_MODE || 'MEDIUM'

const asyncMongoConnect = util.promisify(MongoClient.connect)

async function run () {
  logger.info(`Starting daemon...`)
  const mongoHost = await asyncMongoConnect(URL_MONGO)
  console.log(`Connected to Mongo '${URL_MONGO}'.`)
  logger.info(`Following networks will be scanned ${JSON.stringify(networks)}`)
  const resolveTxOnLedger  = await createTxResolverLedger(networks)
  for (const indyNetwork of networks) {
    await scanNetwork(resolveTxOnLedger, indyNetwork, mongoHost)
  }
}

async function scanNetwork (resolveTx, networkName, mongoHost) {
  logger.info(`Initiating network scan for network '${networkName}'.`)
  try {
    logger.info('Creating TX forwarder')
    const txEmitter = await createTxEmitter(networkName, resolveTx)

    let mongoDb = await mongoHost.db(networkName)
    const timerLock = createTimerLock(scanModes[SCAN_MODE])
    await createConsumerMongo(txEmitter, mongoDb, networkName, storage.subledgerCollections.domain, timerLock)
    await createConsumerMongo(txEmitter, mongoDb, networkName, storage.subledgerCollections.pool, timerLock)
    await createConsumerMongo(txEmitter, mongoDb, networkName, storage.subledgerCollections.config, timerLock)
  } catch (err) {
    logger.error(`Something when wrong creating indy client for network '${networkName}'. Details:`)
    logger.error(err)
    logger.error(err.stack)
  }
}

run()
