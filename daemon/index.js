const assert = require('assert');
const sleep = require('sleep-promise');

const createIndyClient = require('./indyclient');
const storage = require ('indyscan-storage');

const walletName = 'sovrinscan';
const poolName = 'SOVRIN_MAINNET';
const dbName = 'SOVRIN_MAINNET';

// Connection URL
const url = 'mongodb://localhost:27017';

const LEDGER_TYPE_POOL = '0';
const LEDGER_TYPE_DOMAIN = '1';
const LEDGER_TYPE_CONFIG = '2';

async function run() {
    const indyClient = await createIndyClient(poolName, walletName);
    storage.init(url, dbName, async (storageDomain, storagePool, storageConfig, err) => {
        assert.equal(null, err);
        assert(storageDomain!=null);
        assert(storagePool!=null);
        assert(storageConfig!=null);
        console.log(`Storage initialized. Let's scan.`);
        await sleep(6*1000);
        scanLedger(indyClient, storageDomain, LEDGER_TYPE_DOMAIN, 'DOMAIN', 1, 15);
        scanLedger(indyClient, storagePool, LEDGER_TYPE_POOL, 'POOL', 1, 600);
        scanLedger(indyClient, storageConfig, LEDGER_TYPE_CONFIG, 'CONFIG', 1, 600);
    }) ;
}

async function scanLedger(indyClient, storageClient, ledgerType, ledgerName, regularTimeoutSec, noNewTimeoutSec) {
    let txid = (await storageClient.findMaxTxIdInDb()) + 1;
    while (true) {
        console.log(`[LedgerScan][${ledgerName}] Checking ${txid}th transaction.`);
        const tx = await indyClient.getTx(txid, ledgerType);
        if (tx) {
            console.log(`Retrieved tx ${txid}:\n${JSON.stringify(tx)}`);
            await storageClient.addTx(tx);
            await sleep(regularTimeoutSec*1000);
            txid++
        } else {
            console.log(`Seems like tx ${txid} does not yet exist.`);
            await sleep(noNewTimeoutSec*1000)
        }
    }
}

run();
