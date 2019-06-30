/* eslint-env jest */

import { createTxResolverLedger } from '../../../src/resolvers/ledger-resolver'

const network = 'SOVRIN_MAIN_NET'

describe('ledger tx resolution', () => {
  it('should fetch tx from mainnet', async () => {
    const txResolve = await createTxResolverLedger(network)
    const tx = await txResolve(network, 'domain', 5)
    console.log(JSON.stringify(tx))
  })
})
