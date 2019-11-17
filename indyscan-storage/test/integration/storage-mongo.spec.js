/* eslint-env jest */
import {
  mongoAndFilters,
  mongoFilterAboveSeqNo, mongoFilterBelowSeqNo,
  mongoFilterTxnAfterTime,
  mongoFilterTxnBeforeTime,
  mongoFilterByTxTypeNames
} from '../../src/mongo/filter-builder'
import { txNamesToTypes, txNameToTxCode } from 'indyscan-txtype'
import { importFileToStorage } from '../../src/utils/txloader'
import sleep from 'sleep-promise'
import path from 'path'

const util = require('util')
const { createStorageMongo } = require('../../src/mongo/storage-mongo')
const { MongoClient } = require('mongodb')

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017'
const asyncMongoConnect = util.promisify(MongoClient.connect)
const RESOURCE_DIR = path.resolve(__dirname, '../resource')

const suiteUtime = Math.floor(new Date() / 1000)

async function createMongoTxsCollection (mongoDatabase, subledger) {
  let domainCollection = await mongoDatabase.collection(`txs-${subledger}`)
  await domainCollection.createIndex({ 'txnMetadata.seqNo': 1 })
  return domainCollection
}
let mongoHost
let storage

beforeAll(async () => {
  jest.setTimeout(1000 * 60 * 4)
  mongoHost = await asyncMongoConnect(MONGO_URL)
  let mongoDatabase = await mongoHost.db(`TESTRUN-NETWORK-${suiteUtime}`)
  storage = await createStorageMongo(await createMongoTxsCollection(mongoDatabase, 'domain'))
  await importFileToStorage(storage, `${RESOURCE_DIR}/txs-test/domain.json`)
  await sleep(1000) // it takes a moment until mongo index all loaded documents
  console.log(`Finished before all`)
})

afterAll(async () => {
  await mongoHost.close()
})

function areTxsOfTypes (txs, ...expectedTypes) {
  for (const tx of txs) {
    if (!expectedTypes.includes(tx.txn.type)) {
      console.log(`Type of transaction ${JSON.stringify(tx)} is not one of these: ${JSON.stringify(expectedTypes)}`)
      return false
    }
  }
  return true
}

function containsTxOfType (txs, expectedTxType) {
  for (const tx of txs) {
    if (expectedTxType === tx.txn.type) {
      return true
    }
  }
  return false
}

function areTxsAfterTime (txs, utimeThreshold) {
  for (const tx of txs) {
    if (tx.txnMetadata.txnTime < utimeThreshold) {
      return false
    }
  }
  return true
}

function areTxsBeforeTime (txs, utimeThreshold) {
  for (const tx of txs) {
    if (tx.txnMetadata.txnTime > utimeThreshold) {
      return false
    }
  }
  return true
}

describe('basic storage test', () => {
  it('should return 300 as count of domains txs', async () => {
    console.log(`Starting the test`)
    const count = await storage.getTxCount()
    expect(count).toBe(300)
  })

  it('should count 194 SCHEMA and CLAIM_DEF documents', async () => {
    const txFilter = mongoFilterByTxTypeNames(['SCHEMA', 'CLAIM_DEF'])
    const count = await storage.getTxCount(txFilter)
    expect(count).toBe(194)
  })

  it('should get transactions with basic fields defined', async () => {
    const tx = await storage.getTxBySeqNo(150)
    expect(tx.rootHash).toBeDefined()
    expect(tx.auditPath).toBeDefined()
    expect(tx.txnMetadata).toBeDefined()
    expect(tx.txn).toBeDefined()
    expect(tx.txn.type).toBeDefined()
    expect(tx.txn.metadata).toBeDefined()
  })

  it('should by default get all transactions sorted with newest(idx=0) to oldest', async () => {
    const txs = await storage.getTxs()
    expect(Array.isArray(txs)).toBeTruthy()
    expect(txs.length).toBe(300)
    expect(txs[0].txnMetadata.seqNo).toBe(300)
    expect(txs[299].txnMetadata.seqNo).toBe(1)
  })

  it('should get range of transactions', async () => {
    const txs = await storage.getTxs(0, 10)
    expect(Array.isArray(txs)).toBeTruthy()
    expect(txs.length).toBe(10)
  })

  it('should transform documenta', async () => {
    const rootHashTransform = (txs) => txs.map(tx => tx.rootHash)
    const txs = await storage.getTxs(0, 10, null, null, rootHashTransform)
    expect(Array.isArray(txs)).toBeTruthy()
    expect(txs.length).toBe(10)
    expect(txs[0]).toBe('C6UHGXwdPRqyzSnvhZ83rVwCMZLwfNcK2MfbrW1QQ4kD')
  })

  it('objects from tx range should be transactions', async () => {
    const txs = await storage.getTxs(0, 10)
    for (const tx of txs) {
      expect(tx.rootHash).toBeDefined()
      expect(tx.auditPath).toBeDefined()
      expect(tx.txnMetadata).toBeDefined()
      expect(tx.txn).toBeDefined()
      expect(tx.txn.type).toBeDefined()
      expect(tx.txn.metadata).toBeDefined()
    }
  })

  it('should get transactions of specific type', async () => {
    const txFilter = mongoFilterByTxTypeNames([['CLAIM_DEF']])
    const txs = await storage.getTxs(0, 10, txFilter)
    for (const tx of txs) {
      expect(tx.rootHash).toBeDefined()
      expect(tx.auditPath).toBeDefined()
      expect(tx.txnMetadata).toBeDefined()
      expect(tx.txn).toBeDefined()
      expect(tx.txn.type).toBeDefined()
      expect(tx.txn.type).toBe('102')
      expect(tx.txn.metadata).toBeDefined()
    }
  })

  it('should get transactions of two type', async () => {
    const txFilter = mongoFilterByTxTypeNames(['SCHEMA', 'CLAIM_DEF'])
    const txs = await storage.getTxs(0, 10, txFilter)
    expect(areTxsOfTypes(txs, '101', '102')).toBeTruthy()
    expect(containsTxOfType(txs, '101')).toBeTruthy()
    expect(containsTxOfType(txs, '102')).toBeTruthy()
  })

  it('should get transactions with txn before specific time', async () => {
    // txn 50 @ 1519920217
    // txn 61 @ 1520277085
    const txFilter = mongoFilterTxnBeforeTime(1520277085)
    const txs = await storage.getTxs(0, 12, txFilter)
    expect(Array.isArray(txs)).toBeTruthy()
    expect(txs.length).toBe(12)
    expect(txs[0].txnMetadata.seqNo).toBe(60)
    expect(txs[11].txnMetadata.seqNo).toBe(49)
    expect(areTxsBeforeTime(txs, 1520277085)).toBeTruthy()
  })

  it('should get transactions with txn after specific time', async () => {
    // txn 50 @ 1519920217
    // txn 61 @ 1520277085
    const txFilter = mongoFilterTxnAfterTime(1520277085)
    const txs = await storage.getTxs(0, 300, txFilter)
    console.log(txs.length)
    expect(Array.isArray(txs)).toBeTruthy()
    expect(txs.length).toBe(240)
    expect(txs[0].txnMetadata.seqNo).toBe(300)
    expect(txs[238].txnMetadata.seqNo).toBe(62)
    expect(areTxsAfterTime(txs, 1520277085)).toBeTruthy()
  })

  it('should bound transaction time using 2 txntime filters', async () => {
    // txn 50 @ 1519920217 // old tx
    // txn 61 @ 1520277085 // mid
    // txn 70 @ 1520365010 // more recent txn
    const afterFilter = mongoFilterTxnAfterTime(1519920217)
    const beforeFilter = mongoFilterTxnBeforeTime(1520365010)
    const boundTimerangeFilter = mongoAndFilters(beforeFilter, afterFilter)
    const txs = await storage.getTxs(0, 300, boundTimerangeFilter)
    console.log(txs.length)
    expect(Array.isArray(txs)).toBeTruthy()
    expect(txs.length).toBe(20)
    expect(txs[0].txnMetadata.seqNo).toBe(69)
    expect(txs[19].txnMetadata.seqNo).toBe(50)
    expect(areTxsAfterTime(txs, 1519920217)).toBeTruthy()
    expect(areTxsBeforeTime(txs, 1520365010)).toBeTruthy()
  })

  it('should combine 3 filters', async () => {
    // txn 50 @ 1519920217 // old tx
    // txn 61 @ 1520277085 // mid
    // txn 70 @ 1520365010 // more recent txn
    const beforeFilter = mongoFilterTxnBeforeTime(1520365010)
    const afterFilter = mongoFilterTxnAfterTime(1519920217)
    const txTypeFilter = mongoFilterByTxTypeNames(['SCHEMA', 'CLAIM_DEF'])
    const combinedFilter = mongoAndFilters(beforeFilter, afterFilter, txTypeFilter)
    const txs = await storage.getTxs(0, 300, combinedFilter)
    expect(areTxsAfterTime(txs, 1519920217)).toBeTruthy()
    expect(areTxsBeforeTime(txs, 1520365010)).toBeTruthy()
    expect(areTxsOfTypes(txs, ...txNamesToTypes(['SCHEMA', 'CLAIM_DEF']))).toBeTruthy()
    expect(containsTxOfType(txs, txNameToTxCode('SCHEMA'))).toBeTruthy()
    expect(containsTxOfType(txs, txNameToTxCode('CLAIM_DEF'))).toBeTruthy()
  })

  it('should return timestamp of oldest transaction which has a timestamp', async () => {
    const oldest = await storage.getOldestTimestamp()
    expect(oldest).toBe(1518720454)
  })

  it('should get transaction in seqNo range', async () => {
    const filter = mongoAndFilters(mongoFilterAboveSeqNo(200), mongoFilterBelowSeqNo(230))
    const timestamps = await storage.getTxs(0, 100, filter)
    expect(timestamps.length).toBe(30)
    expect(timestamps[0].txnMetadata.seqNo).toBe(229)
    expect(timestamps[29].txnMetadata.seqNo).toBe(200)
  })

  it('should sort by default get all timestamps sorted from newest (idx=0) to oldest', async () => {
    const timestamps = await storage.getTxsTimestamps()
    expect(timestamps.length).toBe(285) // some initial transactions are missing timestamp
    let prevTimestamp = timestamps[0]
    for (let i = 1; i < 285; i++) {
      const thisTimestamp = timestamps[i]
      expect(prevTimestamp).toBeGreaterThanOrEqual(thisTimestamp)
      prevTimestamp = thisTimestamp
    }
  })

  it('should sort txs from newest to oldest by default', async () => {
    const timestamps = await storage.getTxsTimestamps(0, 50)
    expect(timestamps.length).toBe(50)
    expect(timestamps[0]).toBe(1522061779) // from txnMetadata.seqNo = 300
    expect(timestamps[49]).toBe(1521501088) // from txnMetadata.seqNo = 251
  })

  it('should get less than 100 timestamps if filter is applied', async () => {
    const filter = mongoAndFilters(mongoFilterByTxTypeNames(['NYM']), mongoFilterAboveSeqNo(200), mongoFilterBelowSeqNo(301))
    const timestamps = await storage.getTxsTimestamps(0, 100, filter)
    expect(timestamps.length).toBe(9)
  })
})
