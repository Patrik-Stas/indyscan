/* eslint-env jest */
const sleep = require('sleep-promise')
const { deleteDyQuery } = require('../../../src/es/utils')
const { indexExists } = require('../../../src/es/utils')
const { upsertSubdocument } = require('../../../src/es/utils')
const { searchOneDocument } = require('../../../src/es/utils')
const { assureEsIndex } = require('../../../src/es/utils')
const { Client } = require('@elastic/elasticsearch')

const URL_ES = process.env.URL_ES || 'http://localhost:9200'
let esClient
const index = 'storage-integration-assured-index'

async function deleteIntegrationTestIndices () {
  try {
    await esClient.indices.delete({ index })
  } catch (err) {} // the index probably doesn't exist, that's cool
}

beforeAll(async () => {
  esClient = new Client({ node: URL_ES })
})

beforeEach(async () => {
  jest.setTimeout(1000 * 60 * 4)
  await deleteIntegrationTestIndices()
})

async function doesIndexExist (esClient, index) {
  const existsResponse = await esClient.indices.exists({ index })
  const { body: indexExists } = existsResponse
  return indexExists
}

describe('basic es utils tests', () => {
  it('should create ES index if doesnt exist', async () => {
    await assureEsIndex(esClient, index, 0)
    const exists = await doesIndexExist(esClient, index)
    expect(exists).toBeTruthy()
  })

  it('should be okay to call assureEsIndex repeatedly', async () => {
    await assureEsIndex(esClient, index, 0)
    const exists = await doesIndexExist(esClient, index)
    expect(exists).toBeTruthy()
    await assureEsIndex(esClient, index, 0)
    const exists2 = await doesIndexExist(esClient, index)
    expect(exists2).toBeTruthy()
  })

  it('expect index not to exist', async () => {
    // act
    const exists = await indexExists(esClient, 'nonexisting-index')

    // assert
    expect(exists).toBeFalsy()
  })

  it('should search, find and return one document', async () => {
    // arrange
    await assureEsIndex(esClient, index, 0)
    await esClient.index({
      id: 'foobar123',
      index,
      body: { foo: { bar: 42, baz: 256 } }
    })
    const query = {
      term: {
        'foo.bar': {
          value: 42
        }
      }
    }
    await sleep(1000) // takes time to index the stuff

    // act
    const document = await searchOneDocument(esClient, index, query)

    // assert
    expect(document.foo.bar).toBe(42)
    expect(document.foo.baz).toBe(256)
  })

  it('should delete documents by query', async () => {
    await assureEsIndex(esClient, index, 0)
    await upsertSubdocument(esClient, index, 'doc1', { seqNo: 1 })
    await upsertSubdocument(esClient, index, 'doc2', { seqNo: 2 })
    await upsertSubdocument(esClient, index, 'doc3', { seqNo: 3 })
    await upsertSubdocument(esClient, index, 'doc4', { seqNo: 4 })
    await upsertSubdocument(esClient, index, 'doc4', { seqNo: 4 })
    await sleep(1000) // takes time to index the stuff
    const query = {
      range: {
        seqNo: {
          gte: 3
        }
      }
    }
    expect(await searchOneDocument(esClient, index, { term: { seqNo: { value: 3 } } })).toBeDefined()
    expect(await searchOneDocument(esClient, index, { term: { seqNo: { value: 4 } } })).toBeDefined()
    expect(await searchOneDocument(esClient, index, { term: { seqNo: { value: 5 } } })).toBeDefined()
    await deleteDyQuery(esClient, index, query)
    await sleep(1000) // takes time to index the stuff
    expect(await searchOneDocument(esClient, index, { term: { seqNo: { value: 3 } } })).toBeDefined()
    expect(await searchOneDocument(esClient, index, { term: { seqNo: { value: 4 } } })).toBeNull()
    expect(await searchOneDocument(esClient, index, { term: { seqNo: { value: 5 } } })).toBeNull()
  })
})
