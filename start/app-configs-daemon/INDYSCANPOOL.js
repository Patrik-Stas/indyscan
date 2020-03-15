const { createNetOpRtwSerialization } = require('../src/worker-templates/rtw-ledger-to-serialized')
const { createNetOpRtwExpansion } = require('../src/worker-templates/rtw-db-expansion')

const INDY_NETWORK = 'INDYSCANPOOL'
const GENESIS_PATH = `${__dirname}/genesis/INDYSCANPOOL.txn`
const ES_URL = 'http://indyscan-elasticsearch.esnet:9200'
const ES_INDEX = 'txs-indyscanpool'
const WORKER_TIMING = 'SLOW'

async function bootstrap () {
  const ledgerToDbWorkers = await createNetOpRtwSerialization(
    INDY_NETWORK,
    GENESIS_PATH,
    ES_URL,
    ES_INDEX,
    WORKER_TIMING
  )
  const dbSerializedToExpansion = await createNetOpRtwExpansion(
    INDY_NETWORK,
    ES_URL,
    ES_INDEX,
    WORKER_TIMING
  )
  return [dbSerializedToExpansion, ledgerToDbWorkers]
}

module.exports = bootstrap
