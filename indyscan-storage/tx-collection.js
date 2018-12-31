const assert = require('assert');
const keyTransform = require('./transform-keys');
const dotTransformer = keyTransform.createReplacementFunction('.', 'U+FF0E');
const removeDotsFromKeys = keyTransform.recursiveJSONKeyTransform(dotTransformer);


module.exports = async function createTxCollection(mongodb, collectionName) {

    console.log(`Creating tx collection ${collectionName}`);

    const collection = mongodb.collection(collectionName);

    async function getTxRange(skip, limit) {
        return await collection.find().limit(limit).skip(skip).sort({"txnMetadata.seqNo": -1}).toArray();
    }

    async function getAllTimestamps() {
        const arr = await collection.find({}, {"projection": {"txnMetadata.txnTime": 1}}).toArray();
        const filtered = arr.filter(t => !!t.txnMetadata.txnTime).map(t => t.txnMetadata.txnTime * 1000)
        return filtered
    }

    async function findMaxTxIdInDb() {
        const qres = await collection.aggregate([{$group: {_id: null, maxTx: {$max: "$txnMetadata.seqNo"}}}]).toArray()
        const {maxTx} = (qres.length > 0) ? qres[0] : {maxTx: 0}
        // console.log(`Max found transaction was ${util.inspect(maxTx)}`)
        return maxTx
    }

    async function addTx(tx) {
        console.log(`Inserting transaction to ${collectionName} collection!`);
        console.log(JSON.stringify(tx));
        const txWithNoDots = removeDotsFromKeys(tx);
        await collection.insertOne(txWithNoDots, async (err, res) => {
            if (!!err) {
                console.log('Failed to save transaction. Probably because keys contains character not supported by mongodb. Full err:');
                console.log(err);
                console.log(err.stack);
                console.log(`Original transaction: ${JSON.stringify(tx)}`);
                console.log(`Transformed transaction we tried to insert: ${JSON.stringify(txWithNoDots)}`);
                throw Error(`Failed to insert tx in db.`)
            }
        })
    }

    return {
        findMaxTxIdInDb,
        addTx,
        getTxRange,
        getAllTimestamps
    }
}
