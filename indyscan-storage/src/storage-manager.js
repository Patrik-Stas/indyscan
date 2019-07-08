const assert = require('assert')

const { createStorageMongo } = require('./mongo/storage-mongo')
const { MongoClient } = require('mongodb')
const util = require('util')

const asyncMongoConnect = util.promisify(MongoClient.connect)

/*
 Manages multiple IndyScan storages - groups together storages for different networks and subledgers
 */
async function createLedgerStorageManager (mongoUri) {
  let networks = {}

  const mongoHost = await asyncMongoConnect(mongoUri)
  console.log(`Connected to Mongo '${mongoUri}'.`)

  async function close () {
    await mongoHost.close()
  }

  async function createMongoTxsCollection (mongoDatabase, subledger) {
    let domainCollection = await mongoDatabase.collection(`txs-${subledger}`)
    await domainCollection.createIndex({ 'txnMetadata.seqNo': 1 })
    return domainCollection
  }

  async function addIndyNetwork (networkName) {
    assert(typeof networkName === 'string')
    let mongoDatabase = await mongoHost.db(networkName)
    networks[networkName] = {}
    try {
      const domain = await createStorageMongo(await createMongoTxsCollection(mongoDatabase, 'domain'))
      const pool = await createStorageMongo(await createMongoTxsCollection(mongoDatabase, 'pool'))
      const config = await createStorageMongo(await createMongoTxsCollection(mongoDatabase, 'config'))
      networks[networkName]['domain'] = domain
      networks[networkName]['pool'] = pool
      networks[networkName]['config'] = config
    } catch (error) {
      console.error(error)
      console.error(error.stack)
      networks[networkName] = {}
      throw Error(`Error creating ledger store for network ${networkName}`)
    }
  }

  function getLedger (networkName, ledgerName) {
    if (networks[networkName]) {
      if (networks[networkName][ledgerName]) {
        return networks[networkName][ledgerName]
      }
      throw Error(`Can't find ledger '${ledgerName}' for network '${networkName}'.`)
    }
    throw Error(`Can't find network '${networkName}'.`)
  }

  return {
    addIndyNetwork,
    close,
    getLedger
  }
}

module.exports.createLedgerStorageManager = createLedgerStorageManager
