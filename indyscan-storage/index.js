const assert = require('assert');
const MongoClient = require('mongodb').MongoClient;

// There's an issue babel-nodel has with exporting/importing of ES6 import/export style
// Though there is workaround: https://github.com/babel/babel/issues/7566


async function createStorage(collectionName) {

    const collection = mongodb.collection(collectionName);

    async function getTxRange(skip, limit) {
        return await collection.find().limit(limit).skip(skip).sort({"txnMetadata.seqNo": -1}).toArray();
    }

    async function getAllTimestamps() {
        const arr = await collection.find({}, { "projection" : {"txnMetadata.txnTime":1}}).toArray();
        const filtered = arr.filter(t=>!!t.txnMetadata.txnTime).map(t => t.txnMetadata.txnTime * 1000)
        return filtered
    }

    async function findMaxTxIdInDb() {
        const qres = await collection.aggregate([{$group: {_id: null, maxTx: {$max: "$txnMetadata.seqNo"}}}]).toArray()
        const {maxTx} = (qres.length>0) ? qres[0] : {maxTx:0}
        // console.log(`Max found transaction was ${util.inspect(maxTx)}`)
        return maxTx
    }

    async function addTx(tx) {
        await collection.insertOne(tx, (err, res) => {
            assert.equal(err, null);
            console.log(`Stored res ${res}`)
        })
    }

    return {
        findMaxTxIdInDb,
        addTx,
        getTxRange,
        getAllTimestamps
    }
}

const collectionNameDomain="txs-domain";
const collectionNamePool="txs-pool";
const collectionNameConfig="txs-config";

let mongodb;

module.exports.init = async function init(url, dbName, callback) {
    MongoClient.connect(url, async function (err, client) {
        if (err!=null) {
            callback(null, null, null, {err})
        }
        console.log("Connected successfully to MongoDB.");
        mongodb = client.db(dbName);
        const storageDomain = await createStorage(collectionNameDomain);
        const storagePool = await createStorage(collectionNamePool);
        const storageConfig = await createStorage(collectionNameConfig);
        callback(storageDomain, storagePool, storageConfig, null);
    });
};

module.exports.createDomainStorage = async function createDomainStorage() {
    return await createStorage(collectionNameDomain)
};

module.exports.createPoolStorage = async function createPoolStorage() {
    return await createStorage(collectionNamePool)
};

module.exports.createConfigStorage = async function createConfigStorage() {
    return await createStorage(collectionNameConfig)
};