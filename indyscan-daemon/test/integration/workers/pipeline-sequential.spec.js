// TODO: restore worker tests
// /* eslint-env jest */
// const { createTxResolverLedger } = require('../../../src/resolvers/ledger-resolver')
// const { createConsumerSequential } = require('../../../src/consumers/consumer-sequential')
// const { createStorageFs } = require('indyscan-storage')
// const sleep = require('sleep-promise')
//
// const network = 'SOVRIN_MAINNET'
//
// let consumer
// let storage
// let txResolve
//
// describe('ledger tx resolution', () => {
//   beforeAll(async () => {
//     const suiteTime = Math.floor(new Date() / 1)
//     jest.setTimeout(1000 * 60 * 4)
//     storage = await createStorageFs(`teststorage-consumer-seq-${network}-${suiteTime}`)
//     txResolve = await createTxResolverLedger(network)
//   })
//
//   it('should store 4 transactions', async () => {
//     const timerConfig = { periodMs: 1000, unavailableTimeoutMs: 5000, jitterRatio: 0.1 }
//     consumer = createConsumerSequential(txResolve, storage, network, 'DOMAIN', timerConfig)
//     consumer.start()
//     await sleep(1000 * 60 * 3)
//     expect(await storage.getTxCount()).toBeGreaterThanOrEqual(150)
//   })
// })
