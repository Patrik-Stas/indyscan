const logger = require('../logging/logger-main')
const elasticsearch = require('@elastic/elasticsearch')
const { createStorageReadEs } = require('indyscan-storage/src')

/*
 Manages multiple IndyScan storages - groups together storages for different networks
 */
async function createLedgerStorageManager (esUrl) {
  let storages = {}

  logger.info(`Connecting to ElasticSearh '${esUrl}'.`)
  let esClient = new elasticsearch.Client({ node: esUrl })

  async function addIndyNetwork (networkId, networkEsIndex) {
    const storage = await createStorageReadEs(esClient, networkEsIndex, logger)
    storages[networkId] = storage
  }

  function getAvailableNetworks () {
    return Object.keys(storages)
  }

  function getStorage (networkId) {
    if (storages[networkId]) {
      return storages[networkId]
    }
    throw Error(`Can't find network '${networkId}'.`)
  }

  return {
    addIndyNetwork,
    getAvailableNetworks,
    getStorage
  }
}

module.exports.createLedgerStorageManager = createLedgerStorageManager
