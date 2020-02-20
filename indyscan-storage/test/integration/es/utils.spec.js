/* eslint-env jest */
const sleep = require('sleep-promise')
const {indexExists} = require('../../../src/es/utils')
const {upsertSubdocument} = require('../../../src/es/utils')
const {getDocument} = require('../../../src/es/utils')
const {searchOneDocument} = require('../../../src/es/utils')
const {createWinstonLoggerDummy} = require('../../../src/es/utils')
const {assureEsIndex} = require('../../../src/es/utils')
const {Client} = require('@elastic/elasticsearch')

const URL_ES = process.env.URL_ES || 'http://localhost:9200'
let esClient
const index = 'storage-integration-assured-index'

async function deleteIntegrationTestIndices () {
  try {
    await esClient.indices.delete({index})
  } catch (err) {} // the index probably doesn't exist, that's cool
}

beforeAll(async () => {
  esClient = new Client({node: URL_ES})
})

beforeEach(async () => {
  jest.setTimeout(1000 * 60 * 4)
  await deleteIntegrationTestIndices()
})


async function doesIndexExist (esClient, index) {
  const existsResponse = await esClient.indices.exists({index})
  const {body: indexExists} = existsResponse
  return indexExists
}


describe('basic es utils tests', () => {
  it('should create ES index if doesnt exist', async () => {
    await assureEsIndex(esClient, index, 0, createWinstonLoggerDummy())
    let exists = await doesIndexExist(esClient, index)
    expect(exists).toBeTruthy()
  })

  it('should be okay to call assureEsIndex repeatedly', async () => {
    await assureEsIndex(esClient, index, 0, createWinstonLoggerDummy())
    let exists = await doesIndexExist(esClient, index)
    expect(exists).toBeTruthy()
    await assureEsIndex(esClient, index, 0, createWinstonLoggerDummy())
    let exists2 = await doesIndexExist(esClient, index)
    expect(exists2).toBeTruthy()
  })

  it('expect index not to exist', async () => {
    // act
    let exists = await indexExists(esClient, 'nonexisting-index')

    // assert
    expect(exists).toBeFalsy()
  })

  it('should search, find and return one document', async () => {
    // arrange
    await assureEsIndex(esClient, index, 0, createWinstonLoggerDummy())
    await esClient.index({
      id: 'foobar123',
      index,
      body: {foo: {bar: 42, baz: 256}}
    })
    let query = {
      term: {
        'foo.bar': {
          value: 42
        }
      }
    }
    await sleep(1000) // takes time to index the stuff

    //act
    let document = await searchOneDocument(esClient, index, query)

    // assert
    expect(document.foo.bar).toBe(42)
    expect(document.foo.baz).toBe(256)
  })

  it('should add new format representations of tx', async () => {
    let docId = 'wololooo'
    await assureEsIndex(esClient, index, 0, createWinstonLoggerDummy())
    await upsertSubdocument(esClient, index, docId, {format1: {a: 'a'}})
    await upsertSubdocument(esClient, index, docId, {format2: {b: 'b'}})
    await sleep(1000) // takes time to index the stuff
    let doc = await getDocument(esClient, index, docId)
    expect(doc).toBeDefined()
    expect(doc.format1.a).toBe('a')
    expect(doc.format2.b).toBe('b')
  })
})
