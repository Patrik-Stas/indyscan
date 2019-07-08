/* eslint-env jest */
const { createConsumerSequential } = require('../../../src/consumers/consumer-sequential')
const { createTxEmitter } = require('../../../src/tx-emitter')
const { createStorageMem } = require('indyscan-storage')
const sleep = require('sleep-promise')

const network = 'SOVRIN_MAIN_NET'

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

const createTxResolverWithError =  () => {
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
    jest.setTimeout(1000 * 60 * 4)
    storage = createStorageMem()
  })

  it('should store 4 transactions', async () => {
    const txEmitter = await createTxEmitter(network, txResolve)
    const timerConfig = { periodMs: 300, unavailableTimeoutMs: 500, jitterRatio: 0.1 }
    consumer = createConsumerSequential(txEmitter, storage, network, 'domain', timerConfig)
    consumer.start()
    await sleep(1000)
    expect(await storage.getTxCount()).toBe(4)
  })

  it('should timeout and only store 2 transactions', async () => {
    const txEmitter = await createTxEmitter(network, createTxResolverWithError())
    const timerConfig = { periodMs: 300, unavailableTimeoutMs: 1000, jitterRatio: 0.1 }
    consumer = createConsumerSequential(txEmitter, storage, network, 'domain', timerConfig)
    consumer.start()
    await sleep(2300)
    expect(await storage.getTxCount()).toBe(4)
  })
})
