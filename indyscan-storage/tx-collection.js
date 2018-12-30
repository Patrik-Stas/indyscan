const assert = require('assert');

module.exports = async function createTxCollection(mongodb, collectionName) {

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
