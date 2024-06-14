/* eslint-env jest */
const sleep = require('sleep-promise')
const { esFilterSeqNoGte, esFilterSeqNoLt } = require('../../../src/es/es-query-builder')
const { deleteIndex } = require('../../../src/es/utils')
const { createWinstonLoggerDummy } = require('../../../src/es/utils')
const { createStorageReadEs } = require('../../../src/es/storage-read-es')
const { createStorageWriteEs } = require('../../../src/es/storage-write-es')
const toCanonicalJson = require('canonical-json')
const { esSortSeqNoDescending } = require('../../../src/es/es-query-builder')
const { esFilterFormatFieldValue } = require('../../../src/es/es-query-builder')
const { esAndFilters } = require('../../../src/es/es-query-builder')

const { Client } = require('@elastic/elasticsearch')

const URL_ES = process.env.URL_ES || 'http://localhost:9200'
let esClient
const index = 'integration-test-storage-read-es'

function createEsClient () {
  esClient = new Client({ node: URL_ES })
}

async function deleteIntegrationTestIndices () {
  try {
    await deleteIndex(esClient, index)
  } catch (err) {} // the index probably doesn't exist, that's cool
}

beforeAll(async () => {
  jest.setTimeout(1000 * 60 * 4)
  await createEsClient()
})

afterEach(async () => {
  await deleteIntegrationTestIndices()
})

/*
This testsuite is using storageWriteEs module, assuming that it works as expected, AKA assuming that storage-write-es.spec.js is passing
 */
describe('reading transaction formats from elasticsearch', () => {
  it('should write transaction in two formats and read it back', async () => {
    // arrange
    const logger = createWinstonLoggerDummy()
    const storageWriteEs = await createStorageWriteEs(esClient, index, 0, logger)
    const storageReadEs = await createStorageReadEs(esClient, index, logger)
    await storageWriteEs.addTx('domain', 1, 'foo', { foodata: 'fooval' })
    await storageWriteEs.addTx('domain', 1, 'bar', { bardata: 'barval' })

    await sleep(1000) // takes time to index the stuff

    // act
    const domainTx = await storageReadEs.getOneTx('domain', 1)

    // assert
    expect(toCanonicalJson(domainTx.imeta)).toBe(toCanonicalJson(
      { subledger: 'domain', seqNo: 1 }
    ))
    expect(toCanonicalJson(domainTx.idata)).toBe(toCanonicalJson({
      bar: {
        idata: { bardata: 'barval' },
        imeta: { subledger: 'domain', seqNo: 1 }
      },
      foo: {
        idata: { foodata: 'fooval' },
        imeta: { subledger: 'domain', seqNo: 1 }
      }
    }))
  })

  it('should retrieve transaction in various formats', async () => {
    // arrange
    const logger = createWinstonLoggerDummy()
    const storageWriteEs = await createStorageWriteEs(esClient, index, 0, logger)
    const storageReadEs = await createStorageReadEs(esClient, index, logger)
    await storageWriteEs.addTx('domain', 1, 'foo', { foodata: 'foo-domain-1111' })
    await storageWriteEs.addTx('domain', 1, 'bar', { bardata: 'bar-domain-1111' })

    await sleep(2000) // takes time to index the stuff

    // get in foo format
    const fooTx = await storageReadEs.getOneTx('domain', 1, 'foo')
    expect(fooTx).toBeDefined()
    expect(fooTx.idata.foodata).toBe('foo-domain-1111')

    // get in bar format
    const barTx = await storageReadEs.getOneTx('domain', 1, 'bar')
    expect(barTx).toBeDefined()
    expect(barTx.idata.bardata).toBe('bar-domain-1111')

    // get in full format
    const fullTx = await storageReadEs.getOneTx('domain', 1)
    expect(toCanonicalJson(fullTx)).toBe(toCanonicalJson({
      imeta: { subledger: 'domain', seqNo: 1 },
      idata: {
        foo: { idata: { foodata: 'foo-domain-1111' }, imeta: { subledger: 'domain', seqNo: 1 } },
        bar: { idata: { bardata: 'bar-domain-1111' }, imeta: { subledger: 'domain', seqNo: 1 } }
      }
    }))
  })

  it('should retrieve transactions in "full" format', async () => {
    // arrange
    const logger = createWinstonLoggerDummy()
    const storageWriteEs = await createStorageWriteEs(esClient, index, 0, logger)
    const storageReadEs = await createStorageReadEs(esClient, index, logger)
    await storageWriteEs.addTx('domain', 1, 'foo', { foodata: 'foo-domain-1111' })
    await storageWriteEs.addTx('domain', 2, 'foo', { foodata: 'foo-domain-2222' })
    await storageWriteEs.addTx('domain', 3, 'foo', { foodata: 'foo-domain-3333' })
    await storageWriteEs.addTx('domain', 4, 'foo', { foodata: 'foo-domain-4444' })
    await storageWriteEs.addTx('domain', 1, 'bar', { bardata: 'bar-domain-1111' })
    await storageWriteEs.addTx('domain', 2, 'bar', { bardata: 'bar-domain-2222' })
    await storageWriteEs.addTx('domain', 3, 'bar', { bardata: 'bar-domain-3333' })
    await storageWriteEs.addTx('domain', 4, 'bar', { bardata: 'bar-domain-4444' })

    await storageWriteEs.addTx('config', 1, 'foo', { foodata: 'foo-config-1111' })
    await storageWriteEs.addTx('config', 2, 'foo', { foodata: 'foo-config-2222' })
    await storageWriteEs.addTx('config', 3, 'foo', { foodata: 'foo-config-3333' })
    await storageWriteEs.addTx('config', 4, 'foo', { foodata: 'foo-config-4444' })
    await storageWriteEs.addTx('config', 1, 'bar', { bardata: 'bar-config-1111' })
    await storageWriteEs.addTx('config', 2, 'bar', { bardata: 'bar-config-2222' })
    await storageWriteEs.addTx('config', 3, 'bar', { bardata: 'bar-config-3333' })
    await storageWriteEs.addTx('config', 4, 'bar', { bardata: 'bar-config-4444' })

    await sleep(1000) // takes time to index the stuff

    // act
    const domainTx1 = await storageReadEs.getOneTx('domain', 1)
    const domainTx2 = await storageReadEs.getOneTx('domain', 2)
    const domainTx3 = await storageReadEs.getOneTx('domain', 3)
    const domainTx4 = await storageReadEs.getOneTx('domain', 4)
    const configTx1 = await storageReadEs.getOneTx('config', 1)
    const configTx2 = await storageReadEs.getOneTx('config', 2)
    const configTx3 = await storageReadEs.getOneTx('config', 3)
    const configTx4 = await storageReadEs.getOneTx('config', 4)

    // assert
    expect(toCanonicalJson(domainTx1.idata.foo.idata)).toBe(toCanonicalJson({ foodata: 'foo-domain-1111' }))
    expect(toCanonicalJson(domainTx1.idata.bar.idata)).toBe(toCanonicalJson({ bardata: 'bar-domain-1111' }))
    expect(toCanonicalJson(domainTx2.idata.foo.idata)).toBe(toCanonicalJson({ foodata: 'foo-domain-2222' }))
    expect(toCanonicalJson(domainTx2.idata.bar.idata)).toBe(toCanonicalJson({ bardata: 'bar-domain-2222' }))
    expect(toCanonicalJson(domainTx3.idata.foo.idata)).toBe(toCanonicalJson({ foodata: 'foo-domain-3333' }))
    expect(toCanonicalJson(domainTx3.idata.bar.idata)).toBe(toCanonicalJson({ bardata: 'bar-domain-3333' }))
    expect(toCanonicalJson(domainTx4.idata.foo.idata)).toBe(toCanonicalJson({ foodata: 'foo-domain-4444' }))
    expect(toCanonicalJson(domainTx4.idata.bar.idata)).toBe(toCanonicalJson({ bardata: 'bar-domain-4444' }))

    expect(toCanonicalJson(configTx1.idata.foo.idata)).toBe(toCanonicalJson({ foodata: 'foo-config-1111' }))
    expect(toCanonicalJson(configTx1.idata.bar.idata)).toBe(toCanonicalJson({ bardata: 'bar-config-1111' }))
    expect(toCanonicalJson(configTx2.idata.foo.idata)).toBe(toCanonicalJson({ foodata: 'foo-config-2222' }))
    expect(toCanonicalJson(configTx2.idata.bar.idata)).toBe(toCanonicalJson({ bardata: 'bar-config-2222' }))
    expect(toCanonicalJson(configTx3.idata.foo.idata)).toBe(toCanonicalJson({ foodata: 'foo-config-3333' }))
    expect(toCanonicalJson(configTx3.idata.bar.idata)).toBe(toCanonicalJson({ bardata: 'bar-config-3333' }))
    expect(toCanonicalJson(configTx4.idata.foo.idata)).toBe(toCanonicalJson({ foodata: 'foo-config-4444' }))
    expect(toCanonicalJson(configTx4.idata.bar.idata)).toBe(toCanonicalJson({ bardata: 'bar-config-4444' }))
  })

  it('should retrieve range of transaction within a particular format', async () => {
    // arrange
    const logger = createWinstonLoggerDummy()
    const storageWriteEs = await createStorageWriteEs(esClient, index, 0, logger)
    const storageReadEs = await createStorageReadEs(esClient, index, logger)
    await storageWriteEs.addTx('domain', 1, 'foo', { foodata: 'foo-domain-1111' })
    await storageWriteEs.addTx('domain', 2, 'foo', { foodata: 'foo-domain-2222' })
    await storageWriteEs.addTx('domain', 3, 'foo', { foodata: 'foo-domain-3333' })
    await storageWriteEs.addTx('domain', 4, 'foo', { foodata: 'foo-domain-4444' })
    await storageWriteEs.addTx('domain', 5, 'foo', { foodata: 'foo-domain-4444' })
    await storageWriteEs.addTx('domain', 6, 'foo', { foodata: 'foo-domain-6666' })
    await storageWriteEs.addTx('domain', 7, 'foo', { foodata: 'foo-domain-7777' })
    await storageWriteEs.addTx('domain', 8, 'foo', { foodata: 'foo-domain-8888' })
    await storageWriteEs.addTx('domain', 9, 'foo', { foodata: 'foo-domain-9999' })
    await storageWriteEs.addTx('domain', 10, 'foo', { foodata: 'foo-domain-10101010' })
    await storageWriteEs.addTx('domain', 11, 'foo', { foodata: 'foo-domain-11111111' })
    await storageWriteEs.addTx('domain', 12, 'foo', { foodata: 'foo-domain-12121212' })
    await storageWriteEs.addTx('domain', 13, 'foo', { foodata: 'foo-domain-13131313' })

    await storageWriteEs.addTx('domain', 1, 'bar', { bardata: 'bar-domain-1111' })
    await storageWriteEs.addTx('domain', 2, 'bar', { bardata: 'bar-domain-2222' })
    await storageWriteEs.addTx('domain', 3, 'bar', { bardata: 'bar-domain-3333' })
    await storageWriteEs.addTx('domain', 4, 'bar', { bardata: 'bar-domain-4444' })

    await storageWriteEs.addTx('config', 1, 'foo', { foodata: 'foo-config-1111' })
    await storageWriteEs.addTx('config', 2, 'foo', { foodata: 'foo-config-2222' })
    await storageWriteEs.addTx('config', 3, 'foo', { foodata: 'foo-config-3333' })
    await storageWriteEs.addTx('config', 4, 'foo', { foodata: 'foo-config-4444' })
    await storageWriteEs.addTx('config', 5, 'foo', { foodata: 'foo-config-5555' })
    await storageWriteEs.addTx('config', 6, 'foo', { foodata: 'foo-config-6666' })
    await storageWriteEs.addTx('config', 7, 'foo', { foodata: 'foo-config-7777' })

    await sleep(1000) // takes time to index the stuff

    // act
    const domainTxs = await storageReadEs.getManyTxs('domain', 0, 20, esFilterSeqNoGte(4), undefined, 'foo')
    expect(Array.isArray(domainTxs)).toBeTruthy()
    expect(domainTxs.length).toBe(10)
    expect(domainTxs[0].imeta.seqNo).toBe(13)
    expect(domainTxs[1].imeta.seqNo).toBe(12)
    expect(domainTxs[2].imeta.seqNo).toBe(11)
    expect(domainTxs[3].imeta.seqNo).toBe(10)
    expect(domainTxs[4].imeta.seqNo).toBe(9)
    expect(domainTxs[5].imeta.seqNo).toBe(8)
    expect(domainTxs[6].imeta.seqNo).toBe(7)
    expect(domainTxs[7].imeta.seqNo).toBe(6)
    expect(domainTxs[8].imeta.seqNo).toBe(5)
    expect(domainTxs[9].imeta.seqNo).toBe(4)
    expect(toCanonicalJson(domainTxs[9])).toBe(toCanonicalJson({
      idata: { foodata: 'foo-domain-4444' },
      imeta: { subledger: 'domain', seqNo: 4 }
    }))

    const domainTxsWithBarFormat = await storageReadEs.getManyTxs('domain', 0, 20, esFilterSeqNoGte(2), undefined, 'bar')
    expect(Array.isArray(domainTxsWithBarFormat)).toBeTruthy()
    expect(domainTxsWithBarFormat.length).toBe(3)
    expect(toCanonicalJson(domainTxsWithBarFormat[0])).toBe(toCanonicalJson({
      idata: { bardata: 'bar-domain-4444' },
      imeta: { subledger: 'domain', seqNo: 4 }
    }))
    expect(toCanonicalJson(domainTxsWithBarFormat[2])).toBe(toCanonicalJson({
      idata: { bardata: 'bar-domain-2222' },
      imeta: { subledger: 'domain', seqNo: 2 }
    }))
  })

  it('should query transaction capped by seqNo filters', async () => {
    // arrange
    const logger = createWinstonLoggerDummy()
    const storageWriteEs = await createStorageWriteEs(esClient, index, 0, logger)
    const storageReadEs = await createStorageReadEs(esClient, index, logger)
    await storageWriteEs.addTx('domain', 1, 'foo', { foodata: 'foo-domain-1111' })
    await storageWriteEs.addTx('domain', 2, 'foo', { foodata: 'foo-domain-2222' })
    await storageWriteEs.addTx('domain', 3, 'foo', { foodata: 'foo-domain-3333' })
    await storageWriteEs.addTx('domain', 4, 'foo', { foodata: 'foo-domain-4444' })
    await storageWriteEs.addTx('domain', 5, 'foo', { foodata: 'foo-domain-4444' })
    await storageWriteEs.addTx('domain', 6, 'foo', { foodata: 'foo-domain-6666' })
    await storageWriteEs.addTx('domain', 7, 'foo', { foodata: 'foo-domain-7777' })
    await storageWriteEs.addTx('domain', 8, 'foo', { foodata: 'foo-domain-8888' })
    await storageWriteEs.addTx('domain', 9, 'foo', { foodata: 'foo-domain-9999' })
    await storageWriteEs.addTx('domain', 10, 'foo', { foodata: 'foo-domain-10101010' })

    await sleep(1000) // takes time to index the stuff

    // act
    const rangeFilter = esAndFilters(esFilterSeqNoGte(4), esFilterSeqNoLt(8))

    const domainTxs = await storageReadEs.getManyTxs('domain', 2, 2, rangeFilter, undefined, 'foo')
    expect(Array.isArray(domainTxs)).toBeTruthy()
    expect(domainTxs.length).toBe(2)
    expect(domainTxs[0].imeta.seqNo).toBe(5)
    expect(domainTxs[1].imeta.seqNo).toBe(4)
  })

  it('should retrieve range of transaction within a particlar format and apply custom filter', async () => {
    // arrange
    const logger = createWinstonLoggerDummy()
    const storageWriteEs = await createStorageWriteEs(esClient, index, 0, logger)
    await storageWriteEs.setFormatMappings('foo', { fooclass: { type: 'keyword' } })
    const storageReadEs = await createStorageReadEs(esClient, index, logger)
    await storageWriteEs.addTx('domain', 1, 'foo', { foodata: 'foo-domain-1111', fooclass: 'AA' })
    await storageWriteEs.addTx('domain', 2, 'foo', { foodata: 'foo-domain-2222', fooclass: 'AA' })
    await storageWriteEs.addTx('domain', 3, 'foo', { foodata: 'foo-domain-3333', fooclass: 'BB' })
    await storageWriteEs.addTx('domain', 4, 'foo', { foodata: 'foo-domain-4444', fooclass: 'BB' })
    await storageWriteEs.addTx('domain', 5, 'foo', { foodata: 'foo-domain-5555', fooclass: 'CC' })
    await storageWriteEs.addTx('domain', 6, 'foo', { foodata: 'foo-domain-6666', fooclass: 'CC' })

    await storageWriteEs.addTx('domain', 1, 'bar', { bardata: 'bar-domain-1111' })
    await storageWriteEs.addTx('domain', 2, 'bar', { bardata: 'bar-domain-2222' })
    await storageWriteEs.addTx('domain', 3, 'bar', { bardata: 'bar-domain-3333' })
    await storageWriteEs.addTx('domain', 4, 'bar', { bardata: 'bar-domain-4444' })

    await sleep(1000) // takes time to index the stuff

    function esFilterByTxFooClasses (values) {
      return {
        terms: {
          'idata.foo.idata.fooclass': values
        }
      }
    }

    // act
    const txs = await storageReadEs.getManyTxs('domain', 0, 20, esFilterByTxFooClasses(['CC', 'BB']), undefined, 'foo')
    expect(Array.isArray(txs)).toBeTruthy()
    expect(txs.length).toBe(4)
    expect(toCanonicalJson(txs[0])).toBe(toCanonicalJson({
      idata: { foodata: 'foo-domain-6666', fooclass: 'CC' },
      imeta: { subledger: 'domain', seqNo: 6 }
    }))
    expect(toCanonicalJson(txs[1])).toBe(toCanonicalJson({
      idata: { foodata: 'foo-domain-5555', fooclass: 'CC' },
      imeta: { subledger: 'domain', seqNo: 5 }
    }))
    expect(toCanonicalJson(txs[2])).toBe(toCanonicalJson({
      idata: { foodata: 'foo-domain-4444', fooclass: 'BB' },
      imeta: { subledger: 'domain', seqNo: 4 }
    }))
    expect(toCanonicalJson(txs[3])).toBe(toCanonicalJson({
      idata: { foodata: 'foo-domain-3333', fooclass: 'BB' },
      imeta: { subledger: 'domain', seqNo: 3 }
    }))
  })

  it('should count transactions', async () => {
    const logger = createWinstonLoggerDummy()
    const storageWriteEs = await createStorageWriteEs(esClient, index, 0, logger)
    const storageReadEs = await createStorageReadEs(esClient, index, logger)
    await storageWriteEs.addTx('domain', 1, 'foo', { foodata: 'foo-domain-1111' })
    await storageWriteEs.addTx('domain', 2, 'foo', { foodata: 'foo-domain-2222' })
    await storageWriteEs.addTx('domain', 3, 'foo', { foodata: 'foo-domain-3333' })
    await storageWriteEs.addTx('domain', 4, 'foo', { foodata: 'foo-domain-4444' })
    await storageWriteEs.addTx('domain', 1, 'bar', { bardata: 'bar-domain-1111' })
    await storageWriteEs.addTx('domain', 2, 'bar', { bardata: 'bar-domain-2222' })
    await storageWriteEs.addTx('domain', 3, 'bar', { bardata: 'bar-domain-3333' })
    await storageWriteEs.addTx('domain', 4, 'bar', { bardata: 'bar-domain-4444' })

    await storageWriteEs.addTx('config', 1, 'foo', { foodata: 'foo-config-1111' })
    await storageWriteEs.addTx('config', 2, 'foo', { foodata: 'foo-config-2222' })
    await storageWriteEs.addTx('config', 3, 'foo', { foodata: 'foo-config-3333' })
    await storageWriteEs.addTx('config', 4, 'foo', { foodata: 'foo-config-4444' })
    await storageWriteEs.addTx('config', 5, 'bar', { bardata: 'bar-config-1111' })
    await storageWriteEs.addTx('config', 6, 'bar', { bardata: 'bar-config-2222' })

    await sleep(1000) // takes time to index the stuff

    expect(await storageReadEs.getTxCount('domain')).toBe(4)
    expect(await storageReadEs.getTxCount('config')).toBe(6)
    expect(await storageReadEs.getTxCount('config', null)).toBe(6)
    expect(await storageReadEs.getTxCount('config', [esFilterSeqNoGte(2), esFilterSeqNoLt(5)])).toBe(3)
    expect(await storageReadEs.getTxCount('config', esFilterSeqNoLt(5))).toBe(4)
  })

  it('should find maximal seqNo', async () => {
    const logger = createWinstonLoggerDummy()
    const storageWriteEs = await createStorageWriteEs(esClient, index, 0, logger)
    const storageReadEs = await createStorageReadEs(esClient, index, logger)
    await storageWriteEs.addTx('domain', 1, 'foo', { foodata: 'foo-domain-1111' })
    await storageWriteEs.addTx('domain', 2, 'foo', { foodata: 'foo-domain-2222' })
    await storageWriteEs.addTx('domain', 3, 'foo', { foodata: 'foo-domain-3333' })
    await storageWriteEs.addTx('domain', 1, 'bar', { bardata: 'bar-domain-1111' })
    await storageWriteEs.addTx('domain', 2, 'bar', { bardata: 'bar-domain-2222' })

    await storageWriteEs.addTx('config', 1, 'foo', { foodata: 'foo-config-1111' })
    await storageWriteEs.addTx('config', 2, 'foo', { foodata: 'foo-config-2222' })
    await storageWriteEs.addTx('config', 3, 'foo', { foodata: 'foo-config-3333' })
    await storageWriteEs.addTx('config', 4, 'foo', { foodata: 'foo-config-4444' })
    await storageWriteEs.addTx('config', 5, 'foo', { foodata: 'foo-config-5555' })
    await storageWriteEs.addTx('config', 6, 'foo', { foodata: 'foo-config-6666' })

    await sleep(1000) // takes time to index the stuff

    expect(await storageReadEs.findMaxSeqNo('domain')).toBe(3)
    expect(await storageReadEs.findMaxSeqNo('domain', 'foo')).toBe(3)
    expect(await storageReadEs.findMaxSeqNo('domain', 'bar')).toBe(2)
    expect(await storageReadEs.findMaxSeqNo('domain', 'xxx')).toBe(0)
    expect(await storageReadEs.findMaxSeqNo('config')).toBe(6)
    expect(await storageReadEs.findMaxSeqNo('config', 'foo')).toBe(6)
    expect(await storageReadEs.findMaxSeqNo('config', 'xxx')).toBe(0)
    expect(await storageReadEs.findMaxSeqNo('pool')).toBe(0)
  })

  it('should should filter by field value in specified format representation', async () => {
    const logger = createWinstonLoggerDummy()
    const storageWriteEs = await createStorageWriteEs(esClient, index, 0, logger)
    const storageReadEs = await createStorageReadEs(esClient, index, logger)
    await storageWriteEs.addTx('domain', 1, 'foo', { aaa: '111', someid: 'a' })
    await storageWriteEs.addTx('domain', 2, 'foo', { aaa: 'xxx', someid: 'b' })
    await storageWriteEs.addTx('domain', 3, 'foo', { aaa: '111', someid: 'c' })
    await storageWriteEs.addTx('domain', 4, 'foo', { yyy: '111', someid: 'd' })

    await storageWriteEs.addTx('domain', 1, 'bar', { aaa: 'xxx' })
    await storageWriteEs.addTx('domain', 2, 'bar', { aaa: '111' })
    await storageWriteEs.addTx('domain', 3, 'bar', { aaa: '111' })

    await sleep(1000) // takes time to index the stuff

    let res1 = await storageReadEs.getManyTxs('domain', 0, 10, esFilterFormatFieldValue('foo', 'aaa', '111'))
    expect(res1.length).toBe(2)
    expect(res1.find(tx => tx.imeta.seqNo === 1)).toBeDefined()
    expect(res1.find(tx => tx.imeta.seqNo === 3)).toBeDefined()

    let res2 = await storageReadEs.getManyTxs('domain', 0, 1, esFilterFormatFieldValue('foo', 'aaa', '111'), esSortSeqNoDescending(), 'foo')
    expect(res2.length).toBe(1)
    expect(res2.find(tx => (tx.imeta.seqNo === 3) && (tx.idata.someid === 'c'))).toBeDefined()
  })


})
