const txTypes = require('./tx-types')
const assert = require('assert')

const { createLedgerStore } = require('./ledger-storage-mongo')
const { MongoClient } = require('mongodb')
const util = require('util')

const collectionNameDomain = 'txs-domain'
const collectionNamePool = 'txs-pool'
const collectionNameConfig = 'txs-config'

const asyncMongoConnect = util.promisify(MongoClient.connect)

async function createLedgerStorageManager (mongoUri) {
  let networks = {}

  const mongoHost = await asyncMongoConnect(mongoUri)
  console.log(`Connected to Mongo '${mongoUri}'.`)

  async function close () {
    await mongoHost.close()
  }

  async function addIndyNetwork (networkName) {
    assert(typeof networkName === 'string')
    let mongoDatabase = await mongoHost.db(networkName)
    networks[networkName] = {}
    try {
      const domain = await createLedgerStore(mongoDatabase, collectionNameDomain)
      const pool = await createLedgerStore(mongoDatabase, collectionNamePool)
      const config = await createLedgerStore(mongoDatabase, collectionNameConfig)
      networks[networkName][txTypes.domain] = domain
      networks[networkName][txTypes.pool] = pool
      networks[networkName][txTypes.config] = config
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
