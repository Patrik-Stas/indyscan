const MongoClient = require('mongodb').MongoClient
const createTxCollection = require('./tx-collection')
const txTypes = require('./tx-types')

// There's an issue babel-nodel has with exporting/importing of ES6 import/export style
// Though there is workaround: https://github.com/babel/babel/issues/7566

const collectionNameDomain = 'txs-domain'
const collectionNamePool = 'txs-pool'
const collectionNameConfig = 'txs-config'

function createIndyStorageManager () {
  let txCollections = {}

  async function registerDatabase (mongoDbClient, dbname) {
    console.log(`Registering database ${dbname}`)
    const mongodb = mongoDbClient.db(dbname)
    const storageDomain = await createTxCollection(mongodb, collectionNameDomain)
    const storagePool = await createTxCollection(mongodb, collectionNamePool)
    const storageConfig = await createTxCollection(mongodb, collectionNameConfig)
    txCollections[dbname] = {
      storageDomain,
      storagePool,
      storageConfig
    }
  }

  function getTxCollection (dbname, txType) {
    const collection = txCollections[dbname]
    if (!collection) {
      throw Error(`Unknown database ${dbname}. Following txCollection are registered ${JSON.stringify(txCollections)}`)
    }
    if (txType === txTypes.domain) {
      return collection.storageDomain
    } else if (txType === txTypes.config) {
      return collection.storageConfig
    } else if (txType === txTypes.pool) {
      return collection.storagePool
    } else {
      throw Error(`Unknown txType ${txType}. No txCollection available. `)
    }
  }

  return {
    registerDatabase,
    getTxCollection
  }
}

module.exports.init = async function init (mongoUrl, indyNetworks, callback) {
  MongoClient.connect(mongoUrl, async function (err, client) {
    if (err != null) {
      callback(null, { err })
    }
    console.log('Connected successfully to MongoDB.')
    if (indyNetworks.constructor !== Array) {
      throw Error('The indyNetworks argument must be array of strings!')
    }
    const storeManager = createIndyStorageManager()
    for (let i = 0; i < indyNetworks.length; i++) {
      const dbname = indyNetworks[i]
      await storeManager.registerDatabase(client, dbname)
    }
    callback(storeManager, null)
  })
}

module.exports.txTypes = txTypes
