const indy = require('indy-sdk');
const util = require('util');

export default async function createClient(poolName, walletName) {

    console.log(`Connecting to ${poolName }`);
    indy.setProtocolVersion(2);
    const poolHandle = await indy.openPoolLedger(poolName, null);
    console.log('Connected.');

    console.log("Assuring local wallet.");
    const config = JSON.stringify({id: walletName, storage_type: "default"});
    const credentials = JSON.stringify({key : "ke®y"});
    try {
        const wallet = await indy.createWallet(config, credentials);
        console.log("New wallet created.")
    } catch (err) {
        console.log("Wallet probably already exists, will proceed.")
    }
    const wh = await indy.openWallet(config, credentials);
    const res = await indy.createAndStoreMyDid(wh, {});
    const did = res[0];
    const vkey = res[1];
    console.log(`Created did/verkey ${JSON.stringify(res)}`)


    async function getTx(txid) {
        const LEDGER_TYPE_POOL = '0';
        const LEDGER_TYPE_DOMAIN = '1';
        const LEDGER_TYPE_CONFIG = '2';
        const getTx = await indy.buildGetTxnRequest(did, LEDGER_TYPE_DOMAIN, txid);
        // console.log(`GetTx request:\n ${txid}: ${JSON.stringify(getTx, null, 2)}`)
        const tx = await indy.submitRequest(poolHandle, getTx);
        console.log(`Retrieved tx:\n ${txid}: ${JSON.stringify(tx)}`)
        if (tx.op === "REPLY") {
            return tx.result.data
        } else {
            throw Error(`We have issues receiving reply from the network.`)
        }
    }


    return {
        getTx
    }
}