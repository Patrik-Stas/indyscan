const assert = require('assert');

// There's an issue babel-nodel has with exporting/importing of ES6 import/export style
// Though there is workaround: https://github.com/babel/babel/issues/7566
module.exports = async function createStorage(mongodb) {
    const domaintxs = mongodb.collection('txs-domain');

    async function getTxRange(skip, limit) {
        return await domaintxs.find().limit(limit).skip(skip).toArray()
    }

    async function findMaxTxIdInDb() {
        const qres = await domaintxs.aggregate([{$group: {_id: null, maxTx: {$max: "$txnMetadata.seqNo"}}}]).toArray()
        const {maxTx} = (qres.length>0) ? qres[0] : {maxTx:0}
        // console.log(`Max found transaction was ${util.inspect(maxTx)}`)
        return maxTx
    }


    async function addTx(tx) {
        await domaintxs.insertOne(tx, (err, res) => {
            assert.equal(err, null);
            console.log(`Stored res ${res}`)
        })

    }

    return {
        findMaxTxIdInDb,
        addTx,
        getTxRange
    }

}