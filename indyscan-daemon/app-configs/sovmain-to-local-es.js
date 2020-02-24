const { createNetOpRtwExpansion } = require('../src/op-templates/standard-rtw-expansion')

async function bootstrap () {
  let rtwOperation = createNetOpRtwExpansion(
    'SOVRIN_MAINNET',
    `${__dirname}/genesis/SOVRIN_MAINNET.txn`,
    'http://localhost:9200',
    'txs-sovmain',
    'SLOW'
  )
  return rtwOperation
}

module.exports = bootstrap
