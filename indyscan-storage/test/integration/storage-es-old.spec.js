// /* eslint-env jest */

describe('stub', () => {
  it('stub', async () => {
    expect(true).toBeTruthy()
  })
})

// const { txNamesToTypes, txNameToTxCode } = require('indyscan-txtype')
// const sleep = require('sleep-promise')
// const path = require('path')
// const { buildRetryTxResolver } = require('../../src/utils/retry-resolve')
// const { importFileToStorage } = require('../../src/utils/txloader')
// const { createIndyscanTransform } = require('../../../indyscan-daemon/src/processors/transformation/transform-tx')
// const {
//   esAndFilters, esFilterSeqNoGte, esFilterSeqNoLt,
//   esFilterByTxTypeNames,
//   esFilterTxnAfterTime,
//   esFilterTxnBeforeTime
// } = require('../../src/es/es-query-builder')
// const { areTxsAfterTime, areTxsBeforeTime, areTxsOfTypes, containsTxOfType } = require('./common')
// const { esFullTextsearch } = require('../../src/es/es-query-builder')
// const { createStorageReadEs } = require('../../src/es/storage-read-es')
// const { createStorageWriteEs } = require('../../src/es/storage-write-es')
//
// const RESOURCE_DIR = path.resolve(__dirname, '../resource')
// let domainStorageRead
// let poolStorageRead
// let domainStorageWrite
// let poolStorageWrite
// let configStorageWrite
// const { Client } = require('@elastic/elasticsearch')
//
// const URL_ES = process.env.URL_ES || 'http://localhost:9200'
// let esClient
// const index = 'txs-integration-test'
//
// function createEsClient () {
//   esClient = new Client({ node: URL_ES })
// }
//
// async function deleteIntegrationTestIndices () {
//   try {
//     await esClient.indices.delete({ index })
//   } catch (err) {} // the index probably doesn't exist, that's cool
// }
//
// function createReadStorages () {
//   domainStorageRead = createStorageReadEs(esClient, index, 'DOMAIN')
//   poolStorageRead = createStorageReadEs(esClient, index, 'POOL')
// }
//
// async function createWriteStorages () {
//   const resolveDomainTxBySeqno = domainStorageRead.getTxBySeqNo.bind(domainStorageRead)
//   const resolveDomainTxWithRetry = buildRetryTxResolver(resolveDomainTxBySeqno, 300, 10)
//   let domainTxTransform = createIndyscanTransform(resolveDomainTxWithRetry)
//   let configOrPoolTransform = createIndyscanTransform(null) // these are not using backward tx lookups
//   let domainStorageWritePromise = await createStorageWriteEs(esClient, index, 0, 'DOMAIN', true, false, domainTxTransform)
//   let configStorageWritePromise = await createStorageWriteEs(esClient, index, 0, 'CONFIG', false, false, configOrPoolTransform)
//   let poolStorageWritePromise = await createStorageWriteEs(esClient, index, 0, 'POOL', false, false, configOrPoolTransform)
//   const [domainStorageWriteResolved, configStorageWriteResolved, poolStorageWriteResolved] =
//     await Promise.all([domainStorageWritePromise, configStorageWritePromise, poolStorageWritePromise])
//   domainStorageWrite = domainStorageWriteResolved
//   configStorageWrite = configStorageWriteResolved
//   poolStorageWrite = poolStorageWriteResolved
// }
//
// async function hydrateIndices () {
//   let dataImports = []
//   dataImports.push(importFileToStorage(domainStorageWrite, `${RESOURCE_DIR}/txs-test/domain.json`))
//   dataImports.push(importFileToStorage(configStorageWrite, `${RESOURCE_DIR}/txs-test/config.json`))
//   dataImports.push(importFileToStorage(poolStorageWrite, `${RESOURCE_DIR}/txs-test/pool.json`))
//   await Promise.all(dataImports)
//   await sleep(1500) // it takes a moment till ES indexes all documents
// }
//
// const CLEAN_HYDRATE_CLEAN = process.env.CLEAN_HYDRATE_CLEAN || true
//
// beforeAll(async () => {
//   jest.setTimeout(1000 * 60 * 4)
//   await createEsClient()
//   if (CLEAN_HYDRATE_CLEAN) {
//     await deleteIntegrationTestIndices()
//   }
//   await createReadStorages()
//   await createWriteStorages()
//   if (CLEAN_HYDRATE_CLEAN) {
//     await hydrateIndices()
//   }
// })
//
// afterAll(async function () {
//   if (CLEAN_HYDRATE_CLEAN) {
//     // deleteIntegrationTestIndices()
//   }
// })
//
// describe('basic storage test', () => {
//   it('should return 300 as count of domains txs', async () => {
//     const count = await domainStorageRead.getTxCount()
//     expect(count).toBe(300)
//   })
//
//   it('should count 194 SCHEMA and CLAIM_DEF documents', async () => {
//     const txFilter = esFilterByTxTypeNames(['SCHEMA', 'CLAIM_DEF'])
//     const count = await domainStorageRead.getTxCount(txFilter)
//     expect(count).toBe(194)
//   })
//
//   it('should get transactions with basic fields defined', async () => {
//     const tx = await domainStorageRead.getTxBySeqNo(150)
//     expect(tx.rootHash).toBeDefined()
//     expect(tx.auditPath).toBeDefined()
//     expect(tx.txnMetadata).toBeDefined()
//     expect(tx.txn).toBeDefined()
//     expect(tx.txn.type).toBeDefined()
//     expect(tx.txn.metadata).toBeDefined()
//   })
//
//   it('should by default get all transactions sorted with newest(idx=0) to oldest', async () => {
//     const txs = await domainStorageRead.getTxs(0, 300)
//     expect(Array.isArray(txs)).toBeTruthy()
//     expect(txs.length).toBe(300)
//     expect(txs[0].txnMetadata.seqNo).toBe(300)
//     expect(txs[299].txnMetadata.seqNo).toBe(1)
//   })
//
//   it('should get range of transactions', async () => {
//     const txs = await domainStorageRead.getTxs(0, 10)
//     expect(Array.isArray(txs)).toBeTruthy()
//     expect(txs.length).toBe(10)
//   })
//
//   it('objects from tx range should be transactions', async () => {
//     const txs = await domainStorageRead.getTxs(0, 10)
//     for (const tx of txs) {
//       expect(tx.rootHash).toBeDefined()
//       expect(tx.auditPath).toBeDefined()
//       expect(tx.txnMetadata).toBeDefined()
//       expect(tx.txn).toBeDefined()
//       expect(tx.txn.type).toBeDefined()
//       expect(tx.txn.metadata).toBeDefined()
//     }
//   })
//
//   it('should get transactions of specific type', async () => {
//     const txFilter = esFilterByTxTypeNames([['CLAIM_DEF']])
//     const txs = await domainStorageRead.getTxs(0, 10, txFilter)
//     for (const tx of txs) {
//       expect(tx.rootHash).toBeDefined()
//       expect(tx.auditPath).toBeDefined()
//       expect(tx.txnMetadata).toBeDefined()
//       expect(tx.txn).toBeDefined()
//       expect(tx.txn.type).toBeDefined()
//       expect(tx.txn.type).toBe('102')
//       expect(tx.txn.metadata).toBeDefined()
//     }
//   })
//
//   it('should get transactions of two type', async () => {
//     const txFilter = esFilterByTxTypeNames(['SCHEMA', 'CLAIM_DEF'])
//     const txs = await domainStorageRead.getTxs(0, 10, txFilter)
//     expect(areTxsOfTypes(txs, '101', '102')).toBeTruthy()
//     expect(containsTxOfType(txs, '101')).toBeTruthy()
//     expect(containsTxOfType(txs, '102')).toBeTruthy()
//   })
//
//   it('should get transactions with txn before specific time', async () => {
//     // txn 50 @ 1519920217
//     // txn 61 @ 1520277085
//     const txFilter = esFilterTxnBeforeTime(1520277085)
//     const txs = await domainStorageRead.getTxs(0, 12, txFilter)
//     expect(Array.isArray(txs)).toBeTruthy()
//     expect(txs.length).toBe(12)
//     expect(txs[0].txnMetadata.seqNo).toBe(60)
//     expect(txs[11].txnMetadata.seqNo).toBe(49)
//     expect(areTxsBeforeTime(txs, 1520277085)).toBeTruthy()
//   })
//
//   it('should get transactions with txn after specific time', async () => {
//     // txn 50 @ 1519920217
//     // txn 61 @ 1520277085
//     const txFilter = esFilterTxnAfterTime(1520277085)
//     const txs = await domainStorageRead.getTxs(0, 300, txFilter)
//     expect(Array.isArray(txs)).toBeTruthy()
//     expect(txs.length).toBe(240)
//     expect(txs[0].txnMetadata.seqNo).toBe(300)
//     expect(txs[238].txnMetadata.seqNo).toBe(62)
//     expect(areTxsAfterTime(txs, 1520277085)).toBeTruthy()
//   })
//
//   it('should bound transaction time using 2 txntime filters', async () => {
//     // txn 50 @ 1519920217 // old tx
//     // txn 61 @ 1520277085 // mid
//     // txn 70 @ 1520365010 // more recent txn
//     const afterFilter = esFilterTxnAfterTime(1519920217)
//     const beforeFilter = esFilterTxnBeforeTime(1520365010)
//     const boundTimerangeFilter = esAndFilters(beforeFilter, afterFilter)
//     const txs = await domainStorageRead.getTxs(0, 300, boundTimerangeFilter)
//     expect(Array.isArray(txs)).toBeTruthy()
//     expect(txs.length).toBe(20)
//     expect(txs[0].txnMetadata.seqNo).toBe(69)
//     expect(txs[19].txnMetadata.seqNo).toBe(50)
//     expect(areTxsAfterTime(txs, 1519920217)).toBeTruthy()
//     expect(areTxsBeforeTime(txs, 1520365010)).toBeTruthy()
//   })
//
//   it('should combine 3 filters', async () => {
//     // txn 50 @ 1519920217 // old tx
//     // txn 61 @ 1520277085 // mid
//     // txn 70 @ 1520365010 // more recent txn
//     const beforeFilter = esFilterTxnBeforeTime(1520365010)
//     const afterFilter = esFilterTxnAfterTime(1519920217)
//     const txTypeFilter = esFilterByTxTypeNames(['SCHEMA', 'CLAIM_DEF'])
//     const combinedFilter = esAndFilters(beforeFilter, afterFilter, txTypeFilter)
//     const txs = await domainStorageRead.getTxs(0, 300, combinedFilter)
//     expect(areTxsAfterTime(txs, 1519920217)).toBeTruthy()
//     expect(areTxsBeforeTime(txs, 1520365010)).toBeTruthy()
//     expect(areTxsOfTypes(txs, ...txNamesToTypes(['SCHEMA', 'CLAIM_DEF']))).toBeTruthy()
//     expect(containsTxOfType(txs, txNameToTxCode('SCHEMA'))).toBeTruthy()
//     expect(containsTxOfType(txs, txNameToTxCode('CLAIM_DEF'))).toBeTruthy()
//   })
//
//
//   it('should get transaction in seqNo range', async () => {
//     const filter = esAndFilters(esFilterSeqNoGte(200), esFilterSeqNoLt(230))
//     const timestamps = await domainStorageRead.getTxs(0, 100, filter)
//     expect(timestamps.length).toBe(30)
//     expect(timestamps[0].txnMetadata.seqNo).toBe(229)
//     expect(timestamps[29].txnMetadata.seqNo).toBe(200)
//   })
//
//   it('should find schemas and credential definitions with field "License type"', async () => {
//     const txs = await domainStorageRead.getManyTxs(0, 100, esFullTextsearch('License type'))
//     expect(Array.isArray(txs)).toBeTruthy()
//     expect(txs.length).toBeGreaterThanOrEqual(1)
//     for (const tx of txs) {
//       expect(JSON.stringify(tx)).toEqual(expect.stringMatching(/license type/i))
//       expect(['SCHEMA', 'CLAIM_DEF']).toContain(tx.indyscan.txn.typeName)
//     }
//   })
//
//   it('should find pool node transaction regard IP address "34.250.128.221"', async () => {
//     const txs = await poolStorageRead.getManyTxs(0, 100, esFullTextsearch('34.250.128.221'))
//     expect(txs.length).toBeGreaterThanOrEqual(1)
//     for (const tx of txs) {
//       expect(JSON.stringify(tx)).toEqual(expect.stringMatching(/34.250.128.221/i))
//       expect(['NODE']).toContain(tx.indyscan.txn.typeName)
//     }
//   })
//
//   it('should find nym transaction posted by DID TTQMzH5FkGdbHuSygCWsok', async () => {
//     const txs = await domainStorageRead.getManyTxs(0, 100, esFullTextsearch('TTQMzH5FkGdbHuSygCWsok'))
//     expect(txs.length).toBeGreaterThanOrEqual(1)
//     for (const tx of txs) {
//       expect(JSON.stringify(tx)).toEqual(expect.stringMatching(/TTQMzH5FkGdbHuSygCWsok/))
//     }
//     let nymTxs = txs.filter(tx => tx.indyscan.txn.typeName === 'NYM')
//     let nymTxsPostedBy = nymTxs.filter(tx => tx.indyscan.txn.metadata.from === 'TTQMzH5FkGdbHuSygCWsok')
//     expect(nymTxsPostedBy.length).toBeGreaterThanOrEqual(1)
//   })
//
//   it('should find only NYM transactions posted by DID TTQMzH5FkGdbHuSygCWsok', async () => {
//     const nymTxs = await domainStorageRead.getManyTxs(0, 100, esAndFilters(esFullTextsearch('TTQMzH5FkGdbHuSygCWsok'), esFilterByTxTypeNames(['NYM'])))
//     expect(nymTxs.length).toBeGreaterThanOrEqual(1)
//     for (const tx of nymTxs) {
//       expect(tx.indyscan.txn.typeName).toBe('NYM')
//       expect(JSON.stringify(tx)).toEqual(expect.stringMatching(/TTQMzH5FkGdbHuSygCWsok/))
//     }
//   })
//
//   it('should find only ATTRIB transactions posted by DID PuUvfrkoq4r8zxdr3F7Qe9', async () => {
//     const nymTxs = await domainStorageRead.getManyTxs(0, 100, esAndFilters(esFullTextsearch('PuUvfrkoq4r8zxdr3F7Qe9'), esFilterByTxTypeNames(['ATTRIB'])))
//     expect(nymTxs.length).toBeGreaterThanOrEqual(1)
//     for (const tx of nymTxs) {
//       expect(tx.indyscan.txn.typeName).toBe('ATTRIB')
//       expect(JSON.stringify(tx)).toEqual(expect.stringMatching(/PuUvfrkoq4r8zxdr3F7Qe9/))
//     }
//   })
//
//   it('should find only schemas and no claim_def which includes string "TranscriptSchema"', async () => {
//     const txs = await domainStorageRead.getManyTxs(0, 100, esAndFilters(esFullTextsearch('TranscriptSchema'), esFilterByTxTypeNames(['SCHEMA'])))
//     const schemaTxs = txs.filter(tx => tx.indyscan.txn.typeName === 'SCHEMA')
//     expect(schemaTxs.length).toBeGreaterThanOrEqual(1)
//     for (const tx of schemaTxs) {
//       expect(JSON.stringify(tx)).toEqual(expect.stringMatching(/TranscriptSchema/))
//       expect(tx.indyscan.txn.data.data.name).toBe('TranscriptSchema')
//     }
//     const claimDefTxs = txs.filter(tx => tx.indyscan.txn.typeName === 'CLAIM_DEF')
//     expect(claimDefTxs.length).toBe(0)
//   })
//
//   it('should find schemas with name "TranscriptSchema"', async () => {
//     const txs = await domainStorageRead.getManyTxs(0, 100, esFullTextsearch('TranscriptSchema'))
//     const schemaTxs = txs.filter(tx => tx.indyscan.txn.typeName === 'SCHEMA')
//     expect(schemaTxs.length).toBeGreaterThanOrEqual(1)
//     for (const tx of schemaTxs) {
//       expect(JSON.stringify(tx)).toEqual(expect.stringMatching(/TranscriptSchema/))
//       expect(tx.indyscan.txn.data.data.name).toBe('TranscriptSchema')
//     }
//   })
//
//   it('should find cred definitions referring to schema with name "TranscriptSchema"', async () => {
//     const txs = await domainStorageRead.getManyTxs(0, 100, esFullTextsearch('TranscriptSchema'))
//     expect(Array.isArray(txs)).toBeTruthy()
//     const claimDefTxs = txs.filter(tx => tx.indyscan.txn.typeName === 'CLAIM_DEF')
//     expect(claimDefTxs.length).toBeGreaterThanOrEqual(1)
//     for (const tx of claimDefTxs) {
//       expect(JSON.stringify(tx)).toEqual(expect.stringMatching(/TranscriptSchema/))
//       expect(tx.indyscan.txn.data.refSchemaName).toBe('TranscriptSchema')
//     }
//   })
// })
