const assert = require('assert');
const sleep = require('sleep-promise');

const createIndyClient = require('./indyclient');
const storage = require ('indyscan-storage');

const walletName = 'sovrinscan';
const poolName = 'SOVRIN_MAINNET';
const MAINNET_NETWORK = 'SOVRIN_MAINNET';

// Connection URL
const url = 'mongodb://localhost:27017';

const LEDGER_TYPE_POOL = '0';
const LEDGER_TYPE_DOMAIN = '1';
const LEDGER_TYPE_CONFIG = '2';

const indyNetworks = [MAINNET_NETWORK];

async function run() {
    const indyClient = await createIndyClient(poolName, walletName);
    storage.init(url, indyNetworks, async (storageManager, err) => {
        assert.equal(null, err);
        console.log(`Storage initialized. Storage url: ${url}. Indy networks ${JSON.stringify(indyNetworks)}`)
        const txCollectionDomain = storageManager.getTxCollection(MAINNET_NETWORK, storage.txTypes.domain);
        const txCollectionPool = storageManager.getTxCollection(MAINNET_NETWORK, storage.txTypes.pool);
        const txCollectionConfig = storageManager.getTxCollection(MAINNET_NETWORK, storage.txTypes.config);
        assert.equal(true, !!txCollectionDomain);
        assert.equal(true, !!txCollectionPool);
        assert.equal(true, !!txCollectionConfig);
        console.log(`Tx collections ready. Let's scan.`);
        await sleep(6*1000);
        scanLedger(indyClient, txCollectionDomain, LEDGER_TYPE_DOMAIN, 'DOMAIN', 1, 15);
        scanLedger(indyClient, txCollectionPool, LEDGER_TYPE_POOL, 'POOL', 1, 600);
        scanLedger(indyClient, txCollectionConfig, LEDGER_TYPE_CONFIG, 'CONFIG', 1, 600);
    }) ;
}

async function scanLedger(indyClient, txCollection, ledgerType, ledgerName, regularTimeoutSec, noNewTimeoutSec) {
    let txid = (await txCollection.findMaxTxIdInDb()) + 1;
    while (true) {
        console.log(`[LedgerScan][${ledgerName}] Checking ${txid}th transaction.`);
        const tx = await indyClient.getTx(txid, ledgerType);
        if (tx) {
            console.log(`Retrieved tx ${txid}:\n${JSON.stringify(tx)}`);
            await txCollection.addTx(tx);
            await sleep(regularTimeoutSec*1000);
            txid++
        } else {
            console.log(`Seems like tx ${txid} does not yet exist.`);
            await sleep(noNewTimeoutSec*1000)
        }
    }
}

run();
