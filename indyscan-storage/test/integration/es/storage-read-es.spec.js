/* eslint-env jest */
const sleep = require('sleep-promise')
const {esFilterAboveSeqNo} = require('../../../src/es/es-query-builder')
const {deleteIndex} = require('../../../src/es/utils')
const {createWinstonLoggerDummy} = require('../../../src/es/utils')
const {createStorageReadEs} = require('../../../src/es/storage-read-es')
const {createStorageWriteEs} = require('../../../src/es/storage-write-es')

const {Client} = require('@elastic/elasticsearch')

const URL_ES = process.env.URL_ES || 'http://localhost:9200'
let esClient
const index = 'integration-test-storage-read-es'

function createEsClient () {
  esClient = new Client({node: URL_ES})
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
    await storageWriteEs.addTx('domain', 1, 'foo', { "foodata": "fooval" })
    await storageWriteEs.addTx('domain', 1, 'bar', { "bardata": "barval" })

    await sleep(1000) // takes time to index the stuff

    //act
    let domainTx = await storageReadEs.getOneTx('domain', 1)

    // assert
    console.log(JSON.stringify(domainTx))
    expect(JSON.stringify(domainTx.foo.data)).toBe(JSON.stringify({ "foodata": "fooval" }))
    expect(JSON.stringify(domainTx.bar.data)).toBe(JSON.stringify({ "bardata": "barval" }))
  })

  it('should retrieve transaction in particular format', async () => {
    // arrange
    const logger = createWinstonLoggerDummy()
    const storageWriteEs = await createStorageWriteEs(esClient, index, 0, logger)
    const storageReadEs = await createStorageReadEs(esClient, index, logger)
    await storageWriteEs.addTx('domain', 1, 'foo', { "foodata": "foo-domain-1111" })
    await storageWriteEs.addTx('domain', 1, 'bar', { "bardata": "bar-domain-1111" })

    await sleep(1000) // takes time to index the stuff

    //act
    let fooTx = await storageReadEs.getOneTx('domain', 1, 'foo')
    expect(fooTx).toBeDefined()
    expect(fooTx.data.foodata).toBe("foo-domain-1111")

    let barTx = await storageReadEs.getOneTx('domain', 1, 'bar')
    expect(barTx).toBeDefined()
    expect(barTx.data.bardata).toBe("bar-domain-1111")
  })

  it('should write transaction in various formats on various subledgers and retrieve them back one by one', async () => {
    // arrange
    const logger = createWinstonLoggerDummy()
    const storageWriteEs = await createStorageWriteEs(esClient, index, 0, logger)
    const storageReadEs = await createStorageReadEs(esClient, index, logger)
    await storageWriteEs.addTx('domain', 1, 'foo', { "foodata": "foo-domain-1111" })
    await storageWriteEs.addTx('domain', 2, 'foo', { "foodata": "foo-domain-2222" })
    await storageWriteEs.addTx('domain', 3, 'foo', { "foodata": "foo-domain-3333" })
    await storageWriteEs.addTx('domain', 4, 'foo', { "foodata": "foo-domain-4444" })
    await storageWriteEs.addTx('domain', 1, 'bar', { "bardata": "bar-domain-1111" })
    await storageWriteEs.addTx('domain', 2, 'bar', { "bardata": "bar-domain-2222" })
    await storageWriteEs.addTx('domain', 3, 'bar', { "bardata": "bar-domain-3333" })
    await storageWriteEs.addTx('domain', 4, 'bar', { "bardata": "bar-domain-4444" })


    await storageWriteEs.addTx('config', 1, 'foo', { "foodata": "foo-config-1111" })
    await storageWriteEs.addTx('config', 2, 'foo', { "foodata": "foo-config-2222" })
    await storageWriteEs.addTx('config', 3, 'foo', { "foodata": "foo-config-3333" })
    await storageWriteEs.addTx('config', 4, 'foo', { "foodata": "foo-config-4444" })
    await storageWriteEs.addTx('config', 1, 'bar', { "bardata": "bar-config-1111" })
    await storageWriteEs.addTx('config', 2, 'bar', { "bardata": "bar-config-2222" })
    await storageWriteEs.addTx('config', 3, 'bar', { "bardata": "bar-config-3333" })
    await storageWriteEs.addTx('config', 4, 'bar', { "bardata": "bar-config-4444" })

    await sleep(1000) // takes time to index the stuff

    //act
    let domainTx1 = await storageReadEs.getOneTx('domain', 1)
    let domainTx2 = await storageReadEs.getOneTx('domain', 2)
    let domainTx3 = await storageReadEs.getOneTx('domain', 3)
    let domainTx4 = await storageReadEs.getOneTx('domain', 4)
    let configTx1 = await storageReadEs.getOneTx('config', 1)
    let configTx2 = await storageReadEs.getOneTx('config', 2)
    let configTx3 = await storageReadEs.getOneTx('config', 3)
    let configTx4 = await storageReadEs.getOneTx('config', 4)

    // assert
    expect(JSON.stringify(domainTx1.foo.data)).toBe(JSON.stringify({ "foodata": "foo-domain-1111" }))
    expect(JSON.stringify(domainTx1.bar.data)).toBe(JSON.stringify({ "bardata": "bar-domain-1111" }))
    expect(JSON.stringify(domainTx2.foo.data)).toBe(JSON.stringify({ "foodata": "foo-domain-2222" }))
    expect(JSON.stringify(domainTx2.bar.data)).toBe(JSON.stringify({ "bardata": "bar-domain-2222" }))
    expect(JSON.stringify(domainTx3.foo.data)).toBe(JSON.stringify({ "foodata": "foo-domain-3333" }))
    expect(JSON.stringify(domainTx3.bar.data)).toBe(JSON.stringify({ "bardata": "bar-domain-3333" }))
    expect(JSON.stringify(domainTx4.foo.data)).toBe(JSON.stringify({ "foodata": "foo-domain-4444" }))
    expect(JSON.stringify(domainTx4.bar.data)).toBe(JSON.stringify({ "bardata": "bar-domain-4444" }))

    expect(JSON.stringify(configTx1.foo.data)).toBe(JSON.stringify({ "foodata": "foo-config-1111" }))
    expect(JSON.stringify(configTx1.bar.data)).toBe(JSON.stringify({ "bardata": "bar-config-1111" }))
    expect(JSON.stringify(configTx2.foo.data)).toBe(JSON.stringify({ "foodata": "foo-config-2222" }))
    expect(JSON.stringify(configTx2.bar.data)).toBe(JSON.stringify({ "bardata": "bar-config-2222" }))
    expect(JSON.stringify(configTx3.foo.data)).toBe(JSON.stringify({ "foodata": "foo-config-3333" }))
    expect(JSON.stringify(configTx3.bar.data)).toBe(JSON.stringify({ "bardata": "bar-config-3333" }))
    expect(JSON.stringify(configTx4.foo.data)).toBe(JSON.stringify({ "foodata": "foo-config-4444" }))
    expect(JSON.stringify(configTx4.bar.data)).toBe(JSON.stringify({ "bardata": "bar-config-4444" }))
  })

  it('should retrieve range of transactions based on seqno', async () => {
    // arrange
    const logger = createWinstonLoggerDummy()
    const storageWriteEs = await createStorageWriteEs(esClient, index, 0, logger)
    const storageReadEs = await createStorageReadEs(esClient, index, logger)
    await storageWriteEs.addTx('domain', 1, 'foo', { "foodata": "foo-domain-1111" })
    await storageWriteEs.addTx('domain', 2, 'foo', { "foodata": "foo-domain-2222" })
    await storageWriteEs.addTx('domain', 3, 'foo', { "foodata": "foo-domain-3333" })
    await storageWriteEs.addTx('domain', 4, 'foo', { "foodata": "foo-domain-4444" })
    await storageWriteEs.addTx('domain', 5, 'foo', { "foodata": "foo-domain-4444" })
    await storageWriteEs.addTx('domain', 6, 'foo', { "foodata": "foo-domain-4444" })
    await storageWriteEs.addTx('domain', 7, 'foo', { "foodata": "foo-domain-4444" })
    await storageWriteEs.addTx('domain', 8, 'foo', { "foodata": "foo-domain-4444" })
    await storageWriteEs.addTx('domain', 9, 'foo', { "foodata": "foo-domain-4444" })
    await storageWriteEs.addTx('domain', 10, 'foo', { "foodata": "foo-domain-4444" })
    await storageWriteEs.addTx('domain', 11, 'foo', { "foodata": "foo-domain-4444" })
    await storageWriteEs.addTx('domain', 12, 'foo', { "foodata": "foo-domain-4444" })
    await storageWriteEs.addTx('domain', 13, 'foo', { "foodata": "foo-domain-4444" })

    await storageWriteEs.addTx('domain', 1, 'bar', { "bardata": "bar-domain-1111" })
    await storageWriteEs.addTx('domain', 2, 'bar', { "bardata": "bar-domain-2222" })
    await storageWriteEs.addTx('domain', 3, 'bar', { "bardata": "bar-domain-3333" })
    await storageWriteEs.addTx('domain', 4, 'bar', { "bardata": "bar-domain-4444" })

    await storageWriteEs.addTx('config', 1, 'foo', { "foodata": "foo-config-1111" })
    await storageWriteEs.addTx('config', 2, 'foo', { "foodata": "foo-config-2222" })
    await storageWriteEs.addTx('config', 3, 'foo', { "foodata": "foo-config-3333" })
    await storageWriteEs.addTx('config', 4, 'foo', { "foodata": "foo-config-3333" })
    await storageWriteEs.addTx('config', 5, 'foo', { "foodata": "foo-config-3333" })
    await storageWriteEs.addTx('config', 6, 'foo', { "foodata": "foo-config-3333" })
    await storageWriteEs.addTx('config', 7, 'foo', { "foodata": "foo-config-3333" })

    await sleep(1000) // takes time to index the stuff

    //act
    let domainTxs = await storageReadEs.getFullTxs('domain', 0, 20, esFilterAboveSeqNo(4))
    expect(Array.isArray(domainTxs)).toBeTruthy()
    expect(domainTxs.length).toBe(10)
    expect(domainTxs[0].meta.seqNo).toBe(13)
    expect(domainTxs[1].meta.seqNo).toBe(12)
    expect(domainTxs[2].meta.seqNo).toBe(11)
    expect(domainTxs[3].meta.seqNo).toBe(10)
    expect(domainTxs[4].meta.seqNo).toBe(9)
    expect(domainTxs[5].meta.seqNo).toBe(8)
    expect(domainTxs[6].meta.seqNo).toBe(7)
    expect(domainTxs[7].meta.seqNo).toBe(6)
    expect(domainTxs[8].meta.seqNo).toBe(5)
    expect(domainTxs[9].meta.seqNo).toBe(4)
  })
})
