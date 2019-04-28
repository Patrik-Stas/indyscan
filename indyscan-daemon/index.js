const { jitterize } = require('./util')
const { createLedgerStorageManager } = require('indyscan-storage')

const createIndyClient = require('./indyclient')
const sleep = require('sleep-promise')
const storage = require('indyscan-storage')

const URL_MONGO = process.env.URL_MONGO || 'mongodb://localhost:27017'
const INDY_NETWORKS = process.env.INDY_NETWORKS
let ledgerManager

const LEDGER_NAME_TO_CODE = {
  'POOL': '0',
  'DOMAIN': '1',
  'CONFIG': '2'
}

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
  for (const indyNetwork of indyNetworks) {
    await scanNetwork(indyNetwork)
  }
}

async function scanNetwork (networkName) {
  console.log(`Initiating network scan for network '${networkName}'.`)
  try {
    ledgerManager.addIndyNetwork(networkName)
    const indyClient = await createIndyClient(networkName, `sovrinscan-${networkName}`)
    const txCollectionDomain = ledgerManager.getLedger(networkName, storage.txTypes.domain)
    const txCollectionPool = ledgerManager.getLedger(networkName, storage.txTypes.pool)
    const txCollectionConfig = ledgerManager.getLedger(networkName, storage.txTypes.config)
    const { secTimeoutIfNewTxFound, secTimeoutIfNoNewTxFound, secTimeoutOnFailure, jitterRatio } = scanModes[SCAN_MODE]
    console.log(`[${networkName}] Scan mode = ${SCAN_MODE}. Scanning starts soon.
      New-Tx-Found-Timeout=${secTimeoutIfNewTxFound}, 
      No-New-Tx-Found-Timeout=${secTimeoutIfNoNewTxFound}
      Failure-Timeout=${secTimeoutOnFailure} 
      jitterRatio=${jitterRatio}`
    )
    setTimeout(() => {
      scanLedger(indyClient, txCollectionDomain, networkName, 'DOMAIN', secTimeoutIfNewTxFound, secTimeoutIfNoNewTxFound, secTimeoutOnFailure, jitterRatio)
      scanLedger(indyClient, txCollectionPool, networkName, 'POOL', secTimeoutIfNewTxFound, secTimeoutIfNoNewTxFound, secTimeoutOnFailure, jitterRatio)
      scanLedger(indyClient, txCollectionConfig, networkName, 'CONFIG', secTimeoutIfNewTxFound, secTimeoutIfNoNewTxFound, secTimeoutOnFailure, jitterRatio)
    }, 6 * 1000)
  } catch (err) {
    console.error(`Something when wrong creating indy client for network '${networkName}'. Details:`)
    console.error(err)
    console.error(err.stack)
  }
}

async function sleepWithJitter (logPrefix, seconds, jitterRatio) {
  const timeoutMs = jitterize(seconds * 1000, jitterRatio)
  console.debug(`${logPrefix} Sleep for ${timeoutMs}ms.`)
  await sleep(timeoutMs)
}

async function scanLedger (indyClient, txCollection, networkName, ledgerName, regularTimeoutSec, noNewTimeoutSec, failureTimeoutSec, jitterRatio) {
  const ledgerCode = LEDGER_NAME_TO_CODE[ledgerName]
  let txid = (await txCollection.findMaxTxIdInDb()) + 1
  const logPrefix = `[LedgerScan][${networkName}][${ledgerName}]`
  while (true) {
    try {
      console.log(`${logPrefix} Checking ${txid}th transaction.`)
      const tx = await indyClient.getTx(txid, ledgerCode)
      if (tx) {
        console.log(`${logPrefix} Retrieved '${txid}'th tx:\n${txid}:\n${JSON.stringify(tx)}`)
        await txCollection.addTx(tx)
        await sleepWithJitter(logPrefix, regularTimeoutSec, jitterRatio)
        txid++
      } else {
        console.log(`${logPrefix} Seems '${txid}'th tx does not yet exist.`)
        await sleepWithJitter(logPrefix, noNewTimeoutSec, jitterRatio)
      }
    } catch (error) {
      console.log(`${logPrefix} An error occurred:`)
      console.error(error)
      console.error(error.stack)
      await sleepWithJitter(logPrefix, failureTimeoutSec, jitterRatio)
    }
  }
}

run()
