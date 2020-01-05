/* eslint-env jest */
const { createConsumerSequential } = require('../../../src/consumers/consumer-sequential')
const { createStorageReadFs, createStorageWriteFs } = require('indyscan-storage')
const sleep = require('sleep-promise')
const uuid = require('uuid')

const network = 'network-unittest'

let consumer
let storageRead
let storageWrite
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
    const storageName = `storage-unittests/${uuid.v4()}`
    storageRead = await createStorageReadFs(storageName)
    storageWrite = await createStorageWriteFs(storageName)
  })

  it('should store 4 transactions', async () => {
    const sequentialConsumerConfig = {
      timeoutOnSuccess: 300,
      timeoutOnTxIngestionError: 6000,
      timeoutOnLedgerResolutionError: 6000,
      timeoutOnTxNoFound: 2000,
      jitterRatio: 0
    }
    consumer = createConsumerSequential(txResolve, storageRead, storageWrite, network, 'domain', sequentialConsumerConfig)
    consumer.start()
    await sleep(1000)
    consumer.stop()
    await sleep(10)
    expect(await storageRead.getTxCount()).toBe(4)
  })

  it('should timeout and only store 2 transactions', async () => {
    const timerConfig = {
      timeoutOnSuccess: 300,
      timeoutOnTxIngestionError: 500,
      timeoutOnLedgerResolutionError: 500,
      timeoutOnTxNoFound: 1000,
      jitterRatio: 0
    }
    const txResolveWithError = createTxResolverWithError()
    consumer = createConsumerSequential(txResolveWithError, storageRead, storageWrite, network, 'domain', timerConfig)
    consumer.start()
    await sleep(1000)
    consumer.stop()
    expect(await storageRead.getTxCount()).toBe(2)
  })

  it('two sequential consumers with different timings for different subledger on common network should be independent', async () => {
    const storage1Name = `storage-unittests/${uuid.v4()}`
    const storage2Name = `storage-unittests/${uuid.v4()}`
    const storageRead1 = await createStorageReadFs(storage1Name)
    const storageWrite1 = await createStorageWriteFs(storage1Name)
    const storageRead2 = await createStorageReadFs(storage2Name)
    const storageWrite2 = await createStorageWriteFs(storage2Name)
    const timerConfig1 = {
      timeoutOnSuccess: 300,
      timeoutOnTxIngestionError: 1000,
      timeoutOnLedgerResolutionError: 1000,
      timeoutOnTxNoFound: 1000,
      jitterRatio: 0
    }
    const timerConfig2 = {
      timeoutOnSuccess: 1000,
      timeoutOnTxIngestionError: 1000,
      timeoutOnLedgerResolutionError: 1000,
      timeoutOnTxNoFound: 1000,
      jitterRatio: 0
    }
    let consumer1 = createConsumerSequential(txResolve, storageRead1, storageWrite1, network, 'domain-foo', timerConfig1)
    let consumer2 = createConsumerSequential(txResolve, storageRead2, storageWrite2, network, 'domain-bar', timerConfig2)
    consumer1.start()
    consumer2.start()
    await sleep(1400)
    consumer1.stop()
    consumer2.stop()
    expect(await storageRead1.getTxCount()).toBe(5)
    expect(await storageRead2.getTxCount()).toBe(2)
  })
})
