const assert = require('assert');
const sleep = require('sleep-promise');

const createIndyClient = require('./indyclient');
const storage = require ('indyscan-storage');

const SOVRIN_MAINNET = 'SOVRIN_MAINNET';
const SOVRIN_TESTNET = 'SOVRIN_TESTNET';

// Connection URL
const url = 'mongodb://localhost:27017';

const LEDGER_TYPE_POOL = '0';
const LEDGER_TYPE_DOMAIN = '1';
const LEDGER_TYPE_CONFIG = '2';

const indyNetworks = [SOVRIN_MAINNET, SOVRIN_TESTNET];


async function run() {
    storage.init(url, indyNetworks, async (storageManager, err) => {
        assert.equal(null, err);
        console.log(`Storage initialized. Storage url: ${url}. Indy networks ${JSON.stringify(indyNetworks)}`)
        for (let i=0; i<indyNetworks.length; i++) {
            const NETWORK = indyNetworks[i];
            console.log(`Getting ready indy client for Indy network: ${NETWORK}`)
            const indyClient = await createIndyClient(NETWORK, `sovrinscan-${NETWORK}`);
            const txCollectionDomain = storageManager.getTxCollection(NETWORK, storage.txTypes.domain);
            const txCollectionPool   = storageManager.getTxCollection(NETWORK, storage.txTypes.pool);
            const txCollectionConfig = storageManager.getTxCollection(NETWORK, storage.txTypes.config);
            assert.equal(true, !!txCollectionDomain);
            assert.equal(true, !!txCollectionPool);
            assert.equal(true, !!txCollectionConfig);
            console.log(`Tx collections for network ${NETWORK} ready. Scanning starts in few seconds.`);
            setTimeout(()=> {
                scanLedger(indyClient, txCollectionDomain, NETWORK, LEDGER_TYPE_DOMAIN, 'DOMAIN', 1, 15);
                scanLedger(indyClient, txCollectionPool, NETWORK, LEDGER_TYPE_POOL, 'POOL', 1, 600);
                scanLedger(indyClient, txCollectionConfig, NETWORK, LEDGER_TYPE_CONFIG, 'CONFIG', 1, 600);
            }, 10*1000)
        }
    }) ;
}

async function scanLedger(indyClient, txCollection, networkName, ledgerType, ledgerName, regularTimeoutSec, noNewTimeoutSec) {
    let txid = (await txCollection.findMaxTxIdInDb()) + 1;
    while (true) {
        const logPrefix = `[LedgerScan][${networkName}][${ledgerName}]`;
        console.log(`${logPrefix} Checking ${txid}th transaction.`);
        const tx = await indyClient.getTx(txid, ledgerType);
        if (tx) {
            console.log(`${logPrefix} Retrieved '${txid}'th tx:\n${txid}:\n${JSON.stringify(tx)}`);
            await txCollection.addTx(tx);
            await sleep(regularTimeoutSec*1000);
            txid++
        } else {
            console.log(`${logPrefix} Seems '${txid}'th tx does not yet exist.`);
            await sleep(noNewTimeoutSec*1000)
        }
    }
}

run();
