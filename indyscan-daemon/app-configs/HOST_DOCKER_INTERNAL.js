const { createNetOpRtwSerialization } = require('../src/op-templates/standard-rtw-serialization')

async function bootstrap () {
  let rtwOperation = createNetOpRtwSerialization(
    'HOST_DOCKER_INTERNAL',
    `${__dirname}/genesis/HOST_DOCKER_INTERNAL.txn`,
    'http://localhost:9200',
    'txs-localhost',
    'SLOW'
  )
  return rtwOperation
}

module.exports = bootstrap
