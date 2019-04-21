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
  'SLOW': { normalScanPeriodSec: 12, checkScanPeriodSec: 30 },
  'MEDIUM': { normalScanPeriodSec: 6, checkScanPeriodSec: 15 },
  'FAST': { normalScanPeriodSec: 1, checkScanPeriodSec: 1 },
  'TURBO': { normalScanPeriodSec: 0.3, checkScanPeriodSec: 1 },
  'FRENZY': { normalScanPeriodSec: 0.1, checkScanPeriodSec: 1 }
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
    console.log(`Tx collections for network ${networkName} ready. Scanning starts in few seconds.`)
    const normalScanPeriodSec = scanModes[SCAN_MODE].normalScanPeriodSec
    const checkScanPeriodSec = scanModes[SCAN_MODE].checkScanPeriodSec
    console.log(`Scan mode = ${SCAN_MODE}. Normal period=${normalScanPeriodSec}, check period = ${checkScanPeriodSec}`)
    setTimeout(() => {
      scanLedger(indyClient, txCollectionDomain, networkName, 'DOMAIN', normalScanPeriodSec, checkScanPeriodSec)
      scanLedger(indyClient, txCollectionPool, networkName, 'POOL', normalScanPeriodSec, checkScanPeriodSec)
      scanLedger(indyClient, txCollectionConfig, networkName, 'CONFIG', normalScanPeriodSec, checkScanPeriodSec)
    }, 4 * 1000)
  } catch (err) {
    console.error(`Something when wrong creating indy client for network '${networkName}'. Details:`)
    console.error(err)
    console.error(err.stack)
  }
}

async function scanLedger (indyClient, txCollection, networkName, ledgerName, regularTimeoutSec, noNewTimeoutSec) {
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
        await sleep(regularTimeoutSec * 1000)
        txid++
      } else {
        console.log(`${logPrefix} Seems '${txid}'th tx does not yet exist.`)
        await sleep(noNewTimeoutSec * 1000)
      }
    } catch (error) {
      console.log(`${logPrefix} An error occurred:`)
      console.error(error)
      console.error(error.stack)
      await sleep(noNewTimeoutSec * 1000)
    }
  }
}

run()
