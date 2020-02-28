const {createNetOpRtwSerialization} = require('../src/op-templates/rtw-ledger-to-serialized')
const {createNetOpRtwExpansion} = require('../src/op-templates/rtw-db-expansion')


const INDY_NETWORK = 'HOST_DOCKER_INTERNAL'
const GENESIS_PATH = `${__dirname}/genesis/HOST_DOCKER_INTERNAL.txn`
const ES_URL = 'http://localhost:9200'
const ES_INDEX = 'txs-localhost'
const WORKER_TIMING = 'SLOW'

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
    GENESIS_PATH,
    ES_URL,
    ES_INDEX,
    WORKER_TIMING
  )
  return [ledgerToDbWorkers, dbSerializedToExpansion]
  // return [dbSerializedToExpansion]
  // return [ledgerToDbWorkers]
}

module.exports = bootstrap
