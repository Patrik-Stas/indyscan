const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const sleep = require('sleep-promise');

import createIndyClient from './indyclient';
const createStorage = require ('indyscan-storage');

const walletName = 'sovrinscan';
const poolName = 'SOVRIN_MAINNET';
const dbName = 'SOVRIN_MAINNET';

// Connection URL
const url = 'mongodb://localhost:27017';

MongoClient.connect(url, async function (err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to Mongo.");
    const db = client.db(dbName);
    runit(db)
});

async function runit(mongodb) {
    const indyClient = await createIndyClient(poolName, walletName);
    const storageClient = await createStorage(mongodb);
    let txid = (await storageClient.findMaxTxIdInDb()) + 1;

    while (true) {
        console.log(`>>> Scanning tx id: ${txid}`)
        const tx = await indyClient.getTx(txid);
        if (tx) {
            console.log(`Retrieved tx ${txid}:\n${JSON.stringify(tx)}`)
            await storageClient.addTx(tx);
            await sleep(1000);
            txid++
        } else {
            console.log(`Seems like tx ${txid} doesn't yet exist.`)
            await sleep(1000*10)
        }
    }
}

