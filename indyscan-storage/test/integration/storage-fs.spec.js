/* eslint-env jest */
const { importFileToStorage } = require('../../src/utils/txloader')
const sleep = require('sleep-promise')
const path = require('path')
const { createStorageReadFs } = require('../../src/fs/storage-read-fs')
const { createStorageWriteFs } = require('../../src/fs/storage-write-fs')

const RESOURCE_DIR = path.resolve(__dirname, '../resource')
let storageRead
let storageWrite

beforeAll(async () => {
  jest.setTimeout(1000 * 60 * 4)
  const suiteUtime = Math.floor(new Date() / 1000)
  const storageName = `test-storage-fs-${suiteUtime}`
  storageRead = await createStorageReadFs(storageName)
  storageWrite = await createStorageWriteFs(storageName)
  await importFileToStorage(storageWrite, `${RESOURCE_DIR}/txs-test/domain.json`)
  await sleep(1000) // it takes a moment until mongo index all loaded documents
})

describe('basic storage test', () => {
  it('should return 300 as count of domains txs', async () => {
    console.log(`Starting the test`)
    const count = await storageRead.getTxCount()
    expect(count).toBe(300)
  })

  it('should get transactions with basic fields defined', async () => {
    const tx = await storageRead.getTxBySeqNo(150)
    expect(tx.rootHash).toBeDefined()
    expect(tx.auditPath).toBeDefined()
    expect(tx.txnMetadata).toBeDefined()
    expect(tx.txn).toBeDefined()
    expect(tx.txn.type).toBeDefined()
    expect(tx.txn.metadata).toBeDefined()
  })

  it('should by default get all transactions sorted with newest(idx=0) to oldest', async () => {
    const txs = await storageRead.getTxs()
    expect(Array.isArray(txs)).toBeTruthy()
    expect(txs.length).toBe(300)
    expect(txs[0].txnMetadata.seqNo).toBe(300)
    expect(txs[299].txnMetadata.seqNo).toBe(1)
  })

  it('should get range of transactions', async () => {
    const txs = await storageRead.getTxs(0, 10)
    expect(Array.isArray(txs)).toBeTruthy()
    expect(txs.length).toBe(10)
  })

  it('objects from tx range should be transactions', async () => {
    const txs = await storageRead.getTxs(0, 10)
    for (const tx of txs) {
      expect(tx.rootHash).toBeDefined()
      expect(tx.auditPath).toBeDefined()
      expect(tx.txnMetadata).toBeDefined()
      expect(tx.txn).toBeDefined()
      expect(tx.txn.type).toBeDefined()
      expect(tx.txn.metadata).toBeDefined()
    }
  })

  it('should return timestamp of oldest transaction which has a timestamp', async () => {
    const oldest = await storageRead.getOldestTimestamp()
    expect(oldest).toBe(1518720454)
  })
})
