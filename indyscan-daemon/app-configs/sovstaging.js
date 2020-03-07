const { createNetOpRtwSerialization } = require('../src/op-templates/rtw-ledger-to-serialized')
const { createNetOpRtwExpansion } = require('../src/op-templates/rtw-db-expansion')

const INDY_NETWORK = 'SOVRIN_STAGINGNET'
const GENESIS_PATH = `${__dirname}/genesis/${INDY_NETWORK}.txn`
const ES_URL = 'http://localhost:9200'
const ES_INDEX = 'txs-sovstaging'
const WORKER_TIMING = process.env.WORKER_TIMING || 'SLOW'

async function bootstrap () {
  let ledgerToDbWorkers = await createNetOpRtwSerialization(
    INDY_NETWORK,
    GENESIS_PATH,
    ES_URL,
    ES_INDEX,
    WORKER_TIMING
  )
  let dbSerializedToExpansion = await createNetOpRtwExpansion(
    INDY_NETWORK,
    ES_URL,
    ES_INDEX,
    WORKER_TIMING
  )
  return [dbSerializedToExpansion, ledgerToDbWorkers]
}

module.exports = bootstrap
