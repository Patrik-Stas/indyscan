const { createStorageMongo } = require('./mongo/storage-mongo')
const { createMongoCollection } = require('./factory')
const { createStorageEs } = require('./es/storage-es')
const { createStorageFs } = require('./fs/storage-fs')
const mongoTxFilters = require('./mongo/filter-builder')
const esTxFilters = require('./es/es-query-builder')

module.exports = {
  createStorageFs,
  createStorageMongo,
  createStorageEs,
  createMongoCollection,
  mongoTxFilters,
  esTxFilters
}
