const assert = require('assert')

const { createLedgerStore } = require('./ledger-storage-mongo')
const { MongoClient } = require('mongodb')
const util = require('util')

const subledgers = {
  domain: { name: 'domain', collection: 'txs-domain' },
  pool: { name: 'pool', collection: 'txs-pool' },
  config: { name: 'config', collection: 'txs-config}' }
}

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
      const domain = await createLedgerStore(mongoDatabase, subledgers.domain.collection)
      const pool = await createLedgerStore(mongoDatabase, subledgers.pool.collection)
      const config = await createLedgerStore(mongoDatabase, subledgers.config.collection)
      networks[networkName][subledgers.domain.name] = domain
      networks[networkName][subledgers.pool.name] = pool
      networks[networkName][subledgers.config.name] = config
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
module.exports.subledgers = subledgers
