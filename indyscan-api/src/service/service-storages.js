const logger = require('../logging/logger-main')
const elasticsearch = require('@elastic/elasticsearch')
const { createStorageEs } = require('indyscan-storage/src')

/*
 Manages multiple IndyScan storages - groups together storages for different networks and subledgers
 */
async function createLedgerStorageManager (esUrl) {
  let storages = {}

  logger.info(`Connecting to ElasticSearh '${esUrl}'.`)
  let esClient = new elasticsearch.Client({ node: esUrl })

  async function addIndyNetwork (networkId, networkEsIndex) {
    const [storageDomain, storagePool, storageConfig] = await Promise.all([
      createStorageEs(esClient, networkEsIndex, undefined,
        'DOMAIN', false, true, logger),
      createStorageEs(esClient, networkEsIndex, undefined,
        'POOL', false, true, logger),
      createStorageEs(esClient, networkEsIndex, undefined,
        'CONFIG', false, true, logger)
    ])
    storages[networkId] = {}
    storages[networkId]['DOMAIN'] = storageDomain
    storages[networkId]['POOL'] = storagePool
    storages[networkId]['CONFIG'] = storageConfig
  }

  function getAvailableNetworks () {
    return Object.keys(storages)
  }

  function getStorage (networkId, subledgerName) {
    const subledgerUppercased = subledgerName.toUpperCase()
    if (storages[networkId]) {
      if (storages[networkId][subledgerUppercased]) {
        return storages[networkId][subledgerUppercased]
      }
      throw Error(`Can't find ledger '${subledgerUppercased}' for network '${networkId}'.`)
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
