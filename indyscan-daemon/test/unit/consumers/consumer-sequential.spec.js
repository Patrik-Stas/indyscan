/* eslint-env jest */
const { createConsumerSequential } = require('../../../src/consumers/consumer-sequential')
const { createStorageMem } = require('indyscan-storage')
const sleep = require('sleep-promise')

const network = 'network-foo'

let consumer
let storage
const txResolve = async (network, subledger, seqNo) => {
  return new Promise(function (resolve, reject) {
    resolve({
      network,
      subledger,
      seqNo
    })
  })
}

const createTxResolverWithError = () => {
  let errCount = 0

  return async function txResolverWithError (network, subledger, seqNo) {
    return new Promise(function (resolve, reject) {
      if (errCount === 0 && seqNo === 2) {
        errCount++
        reject(Error(`Simulated transaction resolution error. ErrCount:${errCount}`))
      } else {
        resolve({
          network,
          subledger,
          seqNo
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
    storage = createStorageMem()
  })

  it('should store 4 transactions', async () => {
    const txEmitter = await createTxEmitter(network, txResolve)
    const timerConfig = { periodMs: 300, unavailableTimeoutMs: 500, jitterRatio: 0 }
    consumer = createConsumerSequential(txEmitter, storage, network, 'domain', timerConfig, 'TEST:[should store 4 transactions]')
    consumer.start()
    await sleep(1000)
    consumer.stop()
    expect(await storage.getTxCount()).toBe(4)
  })

  it('should timeout and only store 2 transactions', async () => {
    const txEmitter = await createTxEmitter(network, createTxResolverWithError())
    const timerConfig = { periodMs: 300, unavailableTimeoutMs: 1000, jitterRatio: 0 }
    consumer = createConsumerSequential(txEmitter, storage, network, 'domain', timerConfig, 'TEST:[should timeout and only store 2 transactions]')
    consumer.start()
    await sleep(2300)
    consumer.stop()
    expect(await storage.getTxCount()).toBe(4)
  })

  it('two sequential consumers with different timings for the same network/subledger should end up having same txs', async () => {
    const txEmitter = await createTxEmitter(network, txResolve)
    const storage1 = createStorageMem()
    const storage2 = createStorageMem()
    const timerConfig1 = { periodMs: 300, unavailableTimeoutMs: 1000, jitterRatio: 0 }
    const timerConfig2 = { periodMs: 1000, unavailableTimeoutMs: 1000, jitterRatio: 0 }
    let consumer2 = createConsumerSequential(txEmitter, storage1, network, 'domain', timerConfig1, 'TEST:[should feed two consumers]-CONSUMER1')
    let consumer1 = createConsumerSequential(txEmitter, storage2, network, 'domain', timerConfig2, 'TEST:[should feed two consumers]-CONSUMER2')
    consumer1.start()
    consumer2.start()
    await sleep(1000)
    consumer1.stop()
    consumer2.stop()
    expect(await storage1.getTxCount()).toBeGreaterThanOrEqual(5)
    expect(await storage2.getTxCount()).toBeGreaterThanOrEqual(5)
    expect(await storage1.getTxCount()).toBeLessThanOrEqual(6)
    expect(await storage2.getTxCount()).toBeLessThanOrEqual(6)
    expect(await storage1.getTxCount()).toBe(await storage2.getTxCount())
  })

  it('two sequential consumers with different timings for different subledger on common network should be independent', async () => {
    const txEmitter = await createTxEmitter(network, txResolve)
    const storage1 = createStorageMem()
    const storage2 = createStorageMem()
    const timerConfig1 = { periodMs: 300, unavailableTimeoutMs: 1000, jitterRatio: 0 }
    const timerConfig2 = { periodMs: 1000, unavailableTimeoutMs: 1000, jitterRatio: 0 }
    let consumer1 = createConsumerSequential(txEmitter, storage1, network, 'domain-foo', timerConfig1, 'domain-foo-consumer')
    let consumer2 = createConsumerSequential(txEmitter, storage2, network, 'domain-bar', timerConfig2, 'domain-bar-consumer')
    consumer1.start()
    consumer2.start()
    await sleep(1400)
    consumer1.stop()
    consumer2.stop()
    expect(await storage1.getTxCount()).toBe(5)
    expect(await storage2.getTxCount()).toBe(2)
  })

  it('two sequential consumers with different timings for different networks should be independent', async () => {
    const txEmitterFoo = await createTxEmitter('foo', txResolve)
    const txEmitterBar = await createTxEmitter('bar', txResolve)
    const storage1 = createStorageMem()
    const storage2 = createStorageMem()
    const timerConfig1 = { periodMs: 300, unavailableTimeoutMs: 1000, jitterRatio: 0 }
    const timerConfig2 = { periodMs: 1000, unavailableTimeoutMs: 1000, jitterRatio: 0 }
    let consumer1 = createConsumerSequential(txEmitterFoo, storage1, 'network-foo', 'domain', timerConfig1, 'netfoo-domain-consumer')
    let consumer2 = createConsumerSequential(txEmitterBar, storage2, 'network-bar', 'domain', timerConfig2, 'netbar-domain-consumer')
    consumer1.start()
    consumer2.start()
    await sleep(1400)
    consumer1.stop()
    consumer2.stop()
    expect(await storage1.getTxCount()).toBe(5)
    expect(await storage2.getTxCount()).toBe(2)
  })
})
