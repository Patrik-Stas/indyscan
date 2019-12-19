const { createStorage } = require('./storage-wrapper')

/*
File storage strategy is only used for daemon integration tests
 */
async function createStorageWriteFs (name) {
  const fsstorage = await createStorage(name)

  async function addTx (tx) {
    const seqNo = tx['txnMetadata']['seqNo']
    if (!seqNo) {
      throw Error('Transaction must have seqNo.')
    }
    return fsstorage.set(seqNo, tx)
  }

  return {
    addTx
  }
}

module.exports.createStorageWriteFs = createStorageWriteFs
