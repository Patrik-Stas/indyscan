const { createNetOpRtwSerialization } = require('../src/op-templates/rtw-ledger-to-serialized')
const { createNetOpRtwExpansion } = require('../src/op-templates/rtw-db-expansion')

const INDY_NETWORK = 'SOVRIN_MAINNET'
const GENESIS_PATH = `${__dirname}/genesis/SOVRIN_MAINNET.txn`
const ES_URL = 'http://localhost:9200'
const ES_INDEX = 'txs-sovmain'
const WORKER_TIMING = 'MEDIUM'

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
