const { jitterize } = require('./util')
const { createLedgerStorageManager } = require('indyscan-storage')

const createIndyClient = require('./indyclient')
const sleep = require('sleep-promise')
const storage = require('indyscan-storage')
const logger = require('./logging/logger-main')

const URL_MONGO = process.env.URL_MONGO || 'mongodb://localhost:27017'
const INDY_NETWORKS = process.env.INDY_NETWORKS
let ledgerManager

const LEDGER_NAME_TO_CODE = {
  'POOL': '0',
  'DOMAIN': '1',
  'CONFIG': '2'
}

const INITIAL_SCAN_DELAY_MS = process.env.INITIAL_SCAN_DELAY_MS || 1000

const indyNetworks = INDY_NETWORKS.split(',')
const scanModes = {
  'SLOW': { secTimeoutOnFailure: 20, secTimeoutIfNewTxFound: 12, secTimeoutIfNoNewTxFound: 30, jitterRatio: 0.1 },
  'MEDIUM': { secTimeoutOnFailure: 20, secTimeoutIfNewTxFound: 6, secTimeoutIfNoNewTxFound: 15, jitterRatio: 0.1 },
  'INDYSCAN.IO': { secTimeoutOnFailure: 30, secTimeoutIfNewTxFound: 3, secTimeoutIfNoNewTxFound: 6, jitterRatio: 0.15 },
  'FAST': { secTimeoutOnFailure: 20, secTimeoutIfNewTxFound: 1, secTimeoutIfNoNewTxFound: 1, jitterRatio: 0.1 },
  'TURBO': { secTimeoutOnFailure: 20, secTimeoutIfNewTxFound: 0.3, secTimeoutIfNoNewTxFound: 1, jitterRatio: 0.1 },
  'FRENZY': { secTimeoutOnFailure: 20, secTimeoutIfNewTxFound: 0.1, secTimeoutIfNoNewTxFound: 1, jitterRatio: 0.1 }
}

const SCAN_MODE = process.env.SCAN_MODE || 'MEDIUM'

async function run () {
  ledgerManager = await createLedgerStorageManager(URL_MONGO)
  logger.info(`Starting daemon...`)
  logger.info(`Following networks will be scanned ${JSON.stringify(indyNetworks)}`)
  for (const indyNetwork of indyNetworks) {
    await scanNetwork(indyNetwork)
  }
}

async function scanNetwork (networkName) {
  logger.info(`Initiating network scan for network '${networkName}'.`)
  try {
    ledgerManager.addIndyNetwork(networkName)
    const indyClient = await createIndyClient(networkName, `sovrinscan-${networkName}`)
    const txCollectionDomain = ledgerManager.getLedger(networkName, storage.txTypes.domain)
    const txCollectionPool = ledgerManager.getLedger(networkName, storage.txTypes.pool)
    const txCollectionConfig = ledgerManager.getLedger(networkName, storage.txTypes.config)
    const { secTimeoutIfNewTxFound, secTimeoutIfNoNewTxFound, secTimeoutOnFailure, jitterRatio } = scanModes[SCAN_MODE]
    logger.info(`[${networkName}] Scan mode = ${SCAN_MODE}. Scanning starts soon. 
Scanner configuration:
      New-Tx-Found-Timeout=${secTimeoutIfNewTxFound}, 
      No-New-Tx-Found-Timeout=${secTimeoutIfNoNewTxFound}
      Failure-Timeout=${secTimeoutOnFailure} 
      jitterRatio=${jitterRatio}`
    )
    setTimeout(() => {
      scanLedger(indyClient, txCollectionDomain, networkName, 'DOMAIN', secTimeoutIfNewTxFound, secTimeoutIfNoNewTxFound, secTimeoutOnFailure, jitterRatio)
      scanLedger(indyClient, txCollectionPool, networkName, 'POOL', secTimeoutIfNewTxFound, secTimeoutIfNoNewTxFound, secTimeoutOnFailure, jitterRatio)
      scanLedger(indyClient, txCollectionConfig, networkName, 'CONFIG', secTimeoutIfNewTxFound, secTimeoutIfNoNewTxFound, secTimeoutOnFailure, jitterRatio)
    }, INITIAL_SCAN_DELAY_MS)
  } catch (err) {
    logger.error(`Something when wrong creating indy client for network '${networkName}'. Details:`)
    logger.error(err)
    logger.error(err.stack)
  }
}

async function sleepWithJitter (logPrefix, seconds, jitterRatio) {
  const timeoutMs = jitterize(seconds * 1000, jitterRatio)
  logger.debug(`${logPrefix} Sleeping for ${timeoutMs}ms.`)
  await sleep(timeoutMs)
}

async function scanLedger (indyClient, txCollection, networkName, ledgerName, regularTimeoutSec, noNewTimeoutSec, failureTimeoutSec, jitterRatio) {
  const logPrefix = `[${networkName}][${ledgerName}]`
  try {
    const ledgerCode = LEDGER_NAME_TO_CODE[ledgerName]
    let txSeqno = (await txCollection.findMaxTxIdInDb()) + 1
    while (true) {
      try {
        logger.debug(`${logPrefix} Scanning for tx seqno=${txSeqno}.`)
        const tx = await indyClient.getTx(txSeqno, ledgerCode)
        if (tx) {
          logger.debug(`${logPrefix} New tx tx seqno=${txSeqno} retrievevd:\n${JSON.stringify(tx)}`)
          await txCollection.addTx(tx)
          logger.info(`${logPrefix} >>>>>>> New tx seqno=${txSeqno} retrieved and stored`)
          await sleepWithJitter(logPrefix, regularTimeoutSec, jitterRatio)
          txSeqno++
        } else {
          logger.info(`${logPrefix} Tx seqno=${txSeqno} does not yet exist.`)
          await sleepWithJitter(logPrefix, noNewTimeoutSec, jitterRatio)
        }
      } catch (error) {
        logger.error(`${logPrefix} An error occurred while processing tx seqno=${txSeqno}.`)
        logger.error(error)
        logger.error(error.stack)
        await sleepWithJitter(logPrefix, failureTimeoutSec, jitterRatio)
      }
    }
  } catch (err) {
    logger.error(`${logPrefix} Unexpected error. Terminating scanning for ledger [${networkName}][${ledgerName}].`)
    logger.error(err.stack)
  }
}

run()
