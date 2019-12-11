/* eslint-env jest */
const { createConsumerSequential } = require('../../../src/consumers/consumer-sequential')
const { createStorageFs } = require('indyscan-storage')
const sleep = require('sleep-promise')
const uuid = require('uuid')

const network = 'network-unittest'

let consumer
let storage
const txResolve = async (subledger, seqNo) => {
  return new Promise(function (resolve, reject) {
    resolve({
      network,
      subledger,
      txnMetadata: { seqNo }
    })
  })
}

const createTxResolverWithError = () => {
  let errCount = 0

  return async function txResolverWithError (subledger, seqNo) {
    return new Promise(function (resolve, reject) {
      if (errCount === 0 && seqNo === 2) {
        errCount++
        reject(Error(`Simulated transaction resolution error. ErrCount:${errCount}`))
      } else {
        resolve({
          network,
          subledger,
          txnMetadata: { seqNo }
        })
      }
    })
  }
}

describe('ledger tx resolution', () => {
  beforeAll(async () => {
    jest.setTimeout(1000 * 60)
  })

  beforeEach(async () => {
    storage = await createStorageFs(`storage-unittests/${uuid.v4()}`)
  })

  it('should store 4 transactions', async () => {
    const timerConfig = { normalTimeoutMs: 300, errorTimeoutMs: 60 * 1000, timeoutTxNotFoundMs: 2000, jitterRatio: 0 }
    consumer = createConsumerSequential(txResolve, storage, network, 'domain', timerConfig)
    consumer.start()
    await sleep(1000)
    consumer.stop()
    expect(await storage.getTxCount()).toBe(4)
  })

  it('should timeout and only store 2 transactions', async () => {
    const timerConfig = { normalTimeoutMs: 200, errorTimeoutMs: 500, timeoutTxNotFoundMs: 500, jitterRatio: 0 }
    const txResolveWithError = createTxResolverWithError()
    consumer = createConsumerSequential(txResolveWithError, storage, network, 'domain', timerConfig)
    consumer.start()
    await sleep(1000)
    consumer.stop()
    expect(await storage.getTxCount()).toBe(3)
  })

  it('two sequential consumers with different timings for different subledger on common network should be independent', async () => {
    const storage1 = await createStorageFs(`storage-unittests/${uuid.v4()}`)
    const storage2 = await createStorageFs(`storage-unittests/${uuid.v4()}`)
    const timerConfig1 = { normalTimeoutMs: 300, errorTimeoutMs: 1000, timeoutTxNotFoundMs: 1000, jitterRatio: 0 }
    const timerConfig2 = { normalTimeoutMs: 1000, errorTimeoutMs: 1000, timeoutTxNotFoundMs: 1000, jitterRatio: 0 }
    let consumer1 = createConsumerSequential(txResolve, storage1, network, 'domain-foo', timerConfig1)
    let consumer2 = createConsumerSequential(txResolve, storage2, network, 'domain-bar', timerConfig2)
    consumer1.start()
    consumer2.start()
    await sleep(1400)
    consumer1.stop()
    consumer2.stop()
    expect(await storage1.getTxCount()).toBe(5)
    expect(await storage2.getTxCount()).toBe(2)
  })
})
