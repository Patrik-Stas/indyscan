/* eslint-env jest */
const sleep = require('sleep-promise')
const {indexExists} = require('../../../src/es/utils')
const {getMapping} = require('../../../src/es/utils')
const {deleteIndex} = require('../../../src/es/utils')
const {searchOneDocument} = require('../../../src/es/utils')
const {createStorageWriteEs} = require('../../../src')
const {Client} = require('@elastic/elasticsearch')

const URL_ES = process.env.URL_ES || 'http://localhost:9200'
let esClient
const index = 'storage-integration-write-storage-txs'

async function deleteIntegrationTestIndices () {
  try {
    await deleteIndex(esClient, index)
  } catch (err) {} // the index probably doesn't exist, that's cool
}

beforeAll(async () => {
  esClient = new Client({node: URL_ES})
})

beforeEach(async () => {
  jest.setTimeout(1000 * 60 * 4)
  await deleteIntegrationTestIndices()
})

describe('writing txdata to elasticsearch', () => {
  it('should write and find sample tx representation', async () => {
    let writeStorage = await createStorageWriteEs(esClient, index, 0)
    await writeStorage.addTx('domain', 1, 'newformat', {what: 'ever1234', you: 'wish'})
    const {body} = await esClient.search({
      index,
      body: {
        query: {
          term: {
            'newformat.data.what': {
              value: 'ever1234'
            }
          }
        }
      }
    })
    expect(body).toBeDefined()
  })

  it('should persist multiple transaction formats', async () => {
    // arrange
    let writeStorage = await createStorageWriteEs(esClient, index, 0)

    // act
    await writeStorage.addTx('domain', 1, 'format-foo', {what: 'ever1234', you: 'wish'})
    await writeStorage.addTx('domain', 1, 'format-bar', {hello: 'world', world: 'hello'})
    await sleep(1000)

    // assert
    const txFoo = await searchOneDocument(esClient, index, {
      term: {
        'format-foo.data.what': {
          value: 'ever1234'
        }
      }
    })
    expect(txFoo).toBeDefined()
    expect(txFoo['format-foo'].data.what).toBe('ever1234')
    const txBar = await searchOneDocument(esClient, index, {
      term: {
        'format-bar.data.hello': {
          value: 'world'
        }
      }
    })
    expect(txBar).toBeDefined()
    expect(txFoo['format-bar'].data.hello).toBe('world')
  })

  it('expect index not to exist', async () => {
    // act
    let exists = await indexExists(esClient, 'nonexisting-index')

    // assert
    expect(exists).toBeFalsy()
  })

  it('should create default mapping for default and required "meta" format', async () => {
    // arrange
    let testIndex = 'integration-test-expect-default-mapping'
    try {
      await deleteIndex(esClient, testIndex)
    } catch (e) {}
    let esStorage = await createStorageWriteEs(esClient, testIndex, 0)

    // assert
    const mapping = await getMapping(esClient, testIndex)
    const expectedBody = JSON.stringify({
        [testIndex]: {
          'mappings': {
            'properties': {
              'meta': {
                'properties': {
                  'seqNo': {
                    'type': 'integer'
                  },
                  'subledger': {
                    'type': 'keyword'
                  }
                }
              },
            }
          }
        }
      }
    )
    expect(JSON.stringify(mapping.body)).toBe(expectedBody)
  })

  it('should add new mappings', async () => {
    // arrange
    let testIndex = 'index-test-mappings'
    try {
      await deleteIndex(esClient, testIndex)
    } catch (e) {}
    let esStorage = await createStorageWriteEs(esClient, testIndex, 0)
    let mappingFoo = {
      'properties': {
        'format-foo.aaa': {type: 'integer'},
      }
    }
    await sleep(1000)

    // act
    await esStorage.setMappings(mappingFoo)

    // assert
    const mapping = await getMapping(esClient, testIndex)
    const expectedBody = JSON.stringify({
        [testIndex]: {
          'mappings': {
            'properties': {
              'format-foo': {
                'properties': {
                  'aaa': {
                    'type': 'integer'
                  }
                }
              },
              'meta': {
                'properties': {
                  'seqNo': {
                    'type': 'integer'
                  },
                  'subledger': {
                    'type': 'keyword'
                  }
                }
              },
            }
          }
        }
      }
    )
    expect(JSON.stringify(mapping.body)).toBe(expectedBody)

    let mappingBar = {
      'properties': {
        'format-bar.bbb': {type: 'keyword'},
      }
    }
    await sleep(1000)

    // act
    await esStorage.setMappings(mappingBar)

    // assert
    const mappingNew = await getMapping(esClient, testIndex)
    const expectedBody2 = JSON.stringify({
        [testIndex]: {
          'mappings': {
            'properties': {
              'format-bar': {
                'properties': {
                  'bbb': {
                    'type': 'keyword'
                  }
                }
              },
              'format-foo': {
                'properties': {
                  'aaa': {
                    'type': 'integer'
                  }
                }
              },
              'meta': {
                'properties': {
                  'seqNo': {
                    'type': 'integer'
                  },
                  'subledger': {
                    'type': 'keyword'
                  }
                }
              },
            }
          }
        }
      }
    )
    expect(JSON.stringify(mappingNew.body)).toBe(expectedBody2)

    await deleteIndex(esClient, testIndex)
  })
})
