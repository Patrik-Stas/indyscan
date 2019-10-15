const { createTxResolverLedger } = require('./resolvers/ledger-resolver')


async function run () {
  const resolve = await createTxResolverLedger(['SOVRIN_TESTNET'])
  const res = await resolve('SOVRIN_TESTNET', 'pool', '1')
  console.log(JSON.stringify(res))
}


run()
