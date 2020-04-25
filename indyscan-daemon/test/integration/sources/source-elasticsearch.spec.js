/* eslint-env jest */
const toCanonicalJson = require('canonical-json')
const { createSourceElasticsearch } = require('../../../src/sources/source-elasticsearch')
const elasticsearch = require('@elastic/elasticsearch')
const path = require('path')
const uuid = require('uuid')
const { createStorageWriteEs } = require('indyscan-storage')
const sleep = require('sleep-promise')
const { deleteIndex } = require('indyscan-storage/src/es/utils')

const esUrl = 'http://localhost:9200'
let esClient
let index
let esStorageWrite

describe('ledger tx resolution', () => {
  let mainnetSource

  beforeAll(async () => {
    jest.setTimeout(1000 * 30)
  })

  beforeEach(async () => {
    index = `text-${uuid.v4()}`
    esClient = new elasticsearch.Client({ node: esUrl })
    esStorageWrite = await createStorageWriteEs(esClient, index, 0)
    mainnetSource = await createSourceElasticsearch({ indyNetworkId: '-', url: esUrl, index })
  })

  afterEach(async () => {
    deleteIndex(esClient, index)
  })

  it('should store data in format "serialized" and be restores parsed as "original" format', async () => {
    await esStorageWrite.addTx('domain', 1, 'serialized', { json: JSON.stringify({ hello: 'world' }) })
    await sleep(1000)
    const originalTx = await mainnetSource.getTxData('domain', 1, 'original')
    expect(toCanonicalJson(originalTx)).toBe(toCanonicalJson({ hello: 'world' }))
  })

  it('should store data in format "serialized" and loaded in the same form as "serialized"', async () => {
    const savedData = 'Probably-some-serialized-json'
    await esStorageWrite.addTx('domain', 1, 'serialized', savedData)
    await sleep(1000)
    const serializedTx = await mainnetSource.getTxData('domain', 1, 'serialized')
    expect(serializedTx).toBe(savedData)
  })

  it('should store data in custom format and retrieve it back', async () => {
    await esStorageWrite.addTx('domain', 1, 'small', 'aaa')
    await esStorageWrite.addTx('domain', 1, 'big', 'AAA')
    await esStorageWrite.addTx('domain', 2, 'small', 'bbb')
    await esStorageWrite.addTx('domain', 2, 'big', 'BBB')
    await esStorageWrite.addTx('domain', 3, 'small', 'ccc')
    await esStorageWrite.addTx('domain', 3, 'big', 'CCC')
    await sleep(1000)
    expect(await mainnetSource.getTxData('domain', 1, 'small')).toBe('aaa')
    expect(await mainnetSource.getTxData('domain', 1, 'big')).toBe('AAA')
    expect(await mainnetSource.getTxData('domain', 3, 'small')).toBe('ccc')
    expect(await mainnetSource.getTxData('domain', 3, 'big')).toBe('CCC')
  })

  it('should retrieve highest known seqNo of particular format in subledger', async () => {
    await esStorageWrite.addTx('domain', 1, 'small', 'aaa')
    await esStorageWrite.addTx('domain', 2, 'small', 'bbb')
    await esStorageWrite.addTx('domain', 3, 'small', 'ccc')
    await esStorageWrite.addTx('domain', 42, 'big', 'CCC')
    await esStorageWrite.addTx('pool', 99, 'small', 'ccc')
    await esStorageWrite.addTx('pool', 111, 'big', 'PPP')
    await sleep(1000)
    expect(await mainnetSource.getHighestSeqno('domain', 'small')).toBe(3)
    expect(await mainnetSource.getHighestSeqno('domain', 'big')).toBe(42)
    expect(await mainnetSource.getHighestSeqno('pool', 'small')).toBe(99)
    expect(await mainnetSource.getHighestSeqno('pool', 'big')).toBe(111)
  })

  it('should retrieve latest state of a DID', async () => {
    await esStorageWrite.addTx('domain', 1, 'state', { did: 'abc123', stateData: 'foo1' })
    await esStorageWrite.addTx('domain', 2, 'state', { did: 'abc123', stateData: 'foo2' })
    await esStorageWrite.addTx('domain', 3, 'state', { did: 'abc123', stateData: 'foo3' })
    await esStorageWrite.addTx('domain', 4, 'state', { did: 'xyz', stateData: 'XXX' })
    await esStorageWrite.addTx('domain', 5, 'otherformat', { something: 'else' })
    await sleep(1000)
    const abc123State = await mainnetSource.getLatestStateForDid('abc123')
    expect(abc123State.idata.stateData).toBe('foo3')

    const xyzState = await mainnetSource.getLatestStateForDid('xyz')
    expect(xyzState.idata.stateData).toBe('XXX')
  })
})
