// const util = require('./genesis-util')
const assert = require('assert')
const sleep = require('sleep-promise')

const createIndyClient = require('./indyclient')
const storage = require('indyscan-storage')

const url = process.env.URL_MONGO || 'mongodb://localhost:27017'
const INDY_NETWORKS = process.env.INDY_NETWORKS
console.log(`INDYSCAN DAEMON: Indy networks pass via env variable: ${INDY_NETWORKS}`)

const LEDGER_TYPE_POOL = '0'
const LEDGER_TYPE_DOMAIN = '1'
const LEDGER_TYPE_CONFIG = '2'

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
  storage.init(url, indyNetworks, async (storageManager, err) => {
    assert.equal(null, err)
    console.log(`Storage initialized. Storage url : ${url}. Indy networks ${JSON.stringify(indyNetworks)}`)
    for (let i = 0; i < indyNetworks.length; i++) {
      const NETWORK = indyNetworks[i]
      let indyClient
      try {
        indyClient = await createIndyClient(NETWORK, `sovrinscan-${NETWORK}`)
      } catch (err) {
        console.error(`Something when wrong creating indy client for network '${NETWORK}'. Details:`)
        console.error(err)
        console.error(err.stack)
      }
      const txCollectionDomain = storageManager.getTxCollection(NETWORK, storage.txTypes.domain)
      const txCollectionPool = storageManager.getTxCollection(NETWORK, storage.txTypes.pool)
      const txCollectionConfig = storageManager.getTxCollection(NETWORK, storage.txTypes.config)
      assert.strictEqual(true, !!txCollectionDomain)
      assert.strictEqual(true, !!txCollectionPool)
      assert.strictEqual(true, !!txCollectionConfig)
      console.log(`Tx collections for network ${NETWORK} ready. Scanning starts in few seconds.`)
      const normalScanPeriodSec = scanModes[SCAN_MODE].normalScanPeriodSec
      const checkScanPeriodSec = scanModes[SCAN_MODE].checkScanPeriodSec
      console.log(`Scan mode = ${SCAN_MODE}. Normal period=${normalScanPeriodSec}, check period = ${checkScanPeriodSec}`)
      setTimeout(() => {
        scanLedger(indyClient, txCollectionDomain, NETWORK, LEDGER_TYPE_DOMAIN, 'DOMAIN', normalScanPeriodSec, checkScanPeriodSec)
        scanLedger(indyClient, txCollectionPool, NETWORK, LEDGER_TYPE_POOL, 'POOL', normalScanPeriodSec, checkScanPeriodSec)
        scanLedger(indyClient, txCollectionConfig, NETWORK, LEDGER_TYPE_CONFIG, 'CONFIG', normalScanPeriodSec, checkScanPeriodSec)
      }, 4 * 1000)
    }
  })
}

async function scanLedger (indyClient, txCollection, networkName, ledgerType, ledgerName, regularTimeoutSec, noNewTimeoutSec) {
  let txid = (await txCollection.findMaxTxIdInDb()) + 1
  while (true) {
    const logPrefix = `[LedgerScan][${networkName}][${ledgerName}]`
    console.log(`${logPrefix} Checking ${txid}th transaction.`)
    const tx = await indyClient.getTx(txid, ledgerType)
    if (tx) {
      console.log(`${logPrefix} Retrieved '${txid}'th tx:\n${txid}:\n${JSON.stringify(tx)}`)
      await txCollection.addTx(tx)
      await sleep(regularTimeoutSec * 1000)
      txid++
    } else {
      console.log(`${logPrefix} Seems '${txid}'th tx does not yet exist.`)
      await sleep(noNewTimeoutSec * 1000)
    }
  }
}

run()
