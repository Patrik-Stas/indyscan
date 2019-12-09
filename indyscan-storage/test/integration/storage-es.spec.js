/* eslint-env jest */
import { txNamesToTypes, txNameToTxCode } from 'indyscan-txtype'
import sleep from 'sleep-promise'
import path from 'path'
import {
  esAndFilters, esFilterAboveSeqNo, esFilterBelowSeqNo,
  esFilterByTxTypeNames,
  esFilterTxnAfterTime,
  esFilterTxnBeforeTime
} from '../../src/es/es-query-builder'
import { areTxsAfterTime, areTxsBeforeTime, areTxsOfTypes, containsTxOfType } from './common'
import { importFileToStorage } from '../../src/utils/txloader'
const { createStorageEs } = require('../../src/es/storage-es')

const RESOURCE_DIR = path.resolve(__dirname, '../resource')
let domainStorage
const { Client } = require('@elastic/elasticsearch')

const URL_ES = process.env.URL_ES || 'http://localhost:9200'
let esClient

const index = 'txs-integration-test'

beforeAll(async () => {
  jest.setTimeout(1000 * 60 * 4)
  esClient = new Client({ node: URL_ES })
  // try {
  //   await esClient.indices.delete({index})
  // } catch (err) {} // ok, just making sure here

  let domainStoragePromise = await createStorageEs(esClient, index, 0, 'DOMAIN', true, false)
  let configStoragePromise = await createStorageEs(esClient, index, 0, 'CONFIG', false, false)
  let poolStoragePromise = await createStorageEs(esClient, index, 0, 'POOL', false, false)
  const [domainStorageResolved, configStorageResolved, poolStorageResolved] =
    await Promise.all([domainStoragePromise, configStoragePromise, poolStoragePromise])
  domainStorage = domainStorageResolved
  // let dataImports = []
  // dataImports.push(importFileToStorage(domainStorageResolved, `${RESOURCE_DIR}/txs-test/domain.json`))
  // dataImports.push(importFileToStorage(configStorageResolved, `${RESOURCE_DIR}/txs-test/config.json`))
  // dataImports.push(importFileToStorage(poolStorageResolved, `${RESOURCE_DIR}/txs-test/pool.json`))
  // await Promise.all(dataImports)
  await sleep(1000) // it takes a moment until ES indexes all documents
})

afterAll(async function () {
  // await esClient.indices.delete({
  //   index
  // })
})

describe('basic storage test', () => {
  it('should return 300 as count of domains txs', async () => {
    const count = await domainStorage.getTxCount()
    expect(count).toBe(300)
  })

  it('should count 194 SCHEMA and CLAIM_DEF documents', async () => {
    const txFilter = esFilterByTxTypeNames(['SCHEMA', 'CLAIM_DEF'])
    const count = await domainStorage.getTxCount(txFilter)
    expect(count).toBe(194)
  })

  it('should get transactions with basic fields defined', async () => {
    const tx = await domainStorage.getTxBySeqNo(150)
    expect(tx.rootHash).toBeDefined()
    expect(tx.auditPath).toBeDefined()
    expect(tx.txnMetadata).toBeDefined()
    expect(tx.txn).toBeDefined()
    expect(tx.txn.type).toBeDefined()
    expect(tx.txn.metadata).toBeDefined()
  })

  it('should by default get all transactions sorted with newest(idx=0) to oldest', async () => {
    const txs = await domainStorage.getTxs(0, 300)
    expect(Array.isArray(txs)).toBeTruthy()
    expect(txs.length).toBe(300)
    expect(txs[0].txnMetadata.seqNo).toBe(300)
    expect(txs[299].txnMetadata.seqNo).toBe(1)
  })

  it('should get range of transactions', async () => {
    const txs = await domainStorage.getTxs(0, 10)
    expect(Array.isArray(txs)).toBeTruthy()
    expect(txs.length).toBe(10)
  })

  it('objects from tx range should be transactions', async () => {
    const txs = await domainStorage.getTxs(0, 10)
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
    const txFilter = esFilterByTxTypeNames([['CLAIM_DEF']])
    const txs = await domainStorage.getTxs(0, 10, txFilter)
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
    const txFilter = esFilterByTxTypeNames(['SCHEMA', 'CLAIM_DEF'])
    const txs = await domainStorage.getTxs(0, 10, txFilter)
    expect(areTxsOfTypes(txs, '101', '102')).toBeTruthy()
    expect(containsTxOfType(txs, '101')).toBeTruthy()
    expect(containsTxOfType(txs, '102')).toBeTruthy()
  })

  it('should get transactions with txn before specific time', async () => {
    // txn 50 @ 1519920217
    // txn 61 @ 1520277085
    const txFilter = esFilterTxnBeforeTime(1520277085)
    const txs = await domainStorage.getTxs(0, 12, txFilter)
    expect(Array.isArray(txs)).toBeTruthy()
    expect(txs.length).toBe(12)
    expect(txs[0].txnMetadata.seqNo).toBe(60)
    expect(txs[11].txnMetadata.seqNo).toBe(49)
    expect(areTxsBeforeTime(txs, 1520277085)).toBeTruthy()
  })

  it('should get transactions with txn after specific time', async () => {
    // txn 50 @ 1519920217
    // txn 61 @ 1520277085
    const txFilter = esFilterTxnAfterTime(1520277085)
    const txs = await domainStorage.getTxs(0, 300, txFilter)
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
    const afterFilter = esFilterTxnAfterTime(1519920217)
    const beforeFilter = esFilterTxnBeforeTime(1520365010)
    const boundTimerangeFilter = esAndFilters(beforeFilter, afterFilter)
    const txs = await domainStorage.getTxs(0, 300, boundTimerangeFilter)
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
    const beforeFilter = esFilterTxnBeforeTime(1520365010)
    const afterFilter = esFilterTxnAfterTime(1519920217)
    const txTypeFilter = esFilterByTxTypeNames(['SCHEMA', 'CLAIM_DEF'])
    const combinedFilter = esAndFilters(beforeFilter, afterFilter, txTypeFilter)
    const txs = await domainStorage.getTxs(0, 300, combinedFilter)
    expect(areTxsAfterTime(txs, 1519920217)).toBeTruthy()
    expect(areTxsBeforeTime(txs, 1520365010)).toBeTruthy()
    expect(areTxsOfTypes(txs, ...txNamesToTypes(['SCHEMA', 'CLAIM_DEF']))).toBeTruthy()
    expect(containsTxOfType(txs, txNameToTxCode('SCHEMA'))).toBeTruthy()
    expect(containsTxOfType(txs, txNameToTxCode('CLAIM_DEF'))).toBeTruthy()
  })

  it('should return timestamp of oldest transaction which has a timestamp', async () => {
    const oldest = await domainStorage.getOldestTimestamp()
    expect(oldest).toBe(1518720454)
  })

  it('should get transaction in seqNo range', async () => {
    const filter = esAndFilters(esFilterAboveSeqNo(200), esFilterBelowSeqNo(230))
    const timestamps = await domainStorage.getTxs(0, 100, filter)
    expect(timestamps.length).toBe(30)
    expect(timestamps[0].txnMetadata.seqNo).toBe(229)
    expect(timestamps[29].txnMetadata.seqNo).toBe(200)
  })

  it('should sort by default get all timestamps sorted from newest (idx=0) to oldest', async () => {
    const timestamps = await domainStorage.getTxsTimestamps(0, 300)
    expect(timestamps.length).toBe(285) // some initial transactions are missing timestamp
    let prevTimestamp = timestamps[0]
    for (let i = 1; i < 285; i++) {
      const thisTimestamp = timestamps[i]
      expect(prevTimestamp).toBeGreaterThanOrEqual(thisTimestamp)
      prevTimestamp = thisTimestamp
    }
  })

  it('should sort txs from newest to oldest by default', async () => {
    const timestamps = await domainStorage.getTxsTimestamps(0, 50)
    expect(timestamps.length).toBe(50)
    expect(timestamps[0]).toBe(1522061779) // from txnMetadata.seqNo = 300
    expect(timestamps[49]).toBe(1521501088) // from txnMetadata.seqNo = 251
  })

  it('should get less than 100 timestamps if filter is applied', async () => {
    const filter = esAndFilters(esFilterByTxTypeNames(['NYM']), esFilterAboveSeqNo(200), esFilterBelowSeqNo(301))
    const timestamps = await domainStorage.getTxsTimestamps(0, 100, filter)
    expect(timestamps.length).toBe(9)
  })

  it('should find schemas and credential definitions with field "License type"', async () => {
    const txs = await domainStorage.searchTxs(0, 100, "License type")
    expect(Array.isArray(txs)).toBeTruthy()
    expect(txs.length).toBeGreaterThanOrEqual(1)
    for (const tx of txs) {
      expect(JSON.stringify(tx)).toEqual(expect.stringMatching(/license type/i))
      expect(['SCHEMA', 'CLAIM_DEF']).toContain(tx.indyscan.txn.typeName)
    }
  })

  it('should find pool node transaction regard IP address "34.250.128.221"', async () => {
    const txs = await domainStorage.searchTxs(0, 100, "34.250.128.221")
    expect(Array.isArray(txs)).toBeTruthy()
    expect(txs.length).toBeGreaterThanOrEqual(1)
    for (const tx of txs) {
      expect(JSON.stringify(tx)).toEqual(expect.stringMatching(/34.250.128.221/i))
      expect(['NODE']).toContain(tx.indyscan.txn.typeName)
    }
  })

  it('should find nym transaction posted by DID TTQMzH5FkGdbHuSygCWsok', async () => {
    const txs = await domainStorage.searchTxs(0, 100, "TTQMzH5FkGdbHuSygCWsok")
    expect(Array.isArray(txs)).toBeTruthy()
    expect(txs.length).toBeGreaterThanOrEqual(1)
    for (const tx of txs) {
      expect(JSON.stringify(tx)).toEqual(expect.stringMatching(/TTQMzH5FkGdbHuSygCWsok/))
    }
    let nymTxs = txs.filter(tx => tx.indyscan.txn.typeName === 'NYM')
    let nymTxsPostedBy = nymTxs.filter(tx => tx.indyscan.txn.metadata.from === 'TTQMzH5FkGdbHuSygCWsok')
    expect(nymTxsPostedBy.length).toBeGreaterThanOrEqual(1)
  })

  it('should find schemas with name "TranscriptSchema"', async () => {
    const txs = await domainStorage.searchTxs(0, 100, "TranscriptSchema")
    expect(Array.isArray(txs)).toBeTruthy()
    const schemaTxs = txs.filter(tx => tx.indyscan.txn.typeName === 'SCHEMA')
    expect(schemaTxs.length).toBeGreaterThanOrEqual(1)
    for (const tx of schemaTxs) {
      expect(JSON.stringify(tx)).toEqual(expect.stringMatching(/TranscriptSchema/))
      expect(tx.indyscan.txn.data.data.name).toBe('TranscriptSchema')
    }
  })

  it('should find cred definitions referring to schema with name "TranscriptSchema"', async () => {
    const txs = await domainStorage.searchTxs(0, 100, "TranscriptSchema")
    expect(Array.isArray(txs)).toBeTruthy()
    const claimDefTxs = txs.filter(tx => tx.indyscan.txn.typeName === 'CLAIM_DEF')
    expect(claimDefTxs.length).toBeGreaterThanOrEqual(1)
    for (const tx of claimDefTxs) {
      expect(JSON.stringify(tx)).toEqual(expect.stringMatching(/TranscriptSchema/))
      expect(tx.indyscan.txn.data.refSchemaName).toBe('TranscriptSchema')
    }
  })
})
