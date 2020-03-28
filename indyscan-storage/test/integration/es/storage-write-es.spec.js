/* eslint-env jest */
const sleep = require('sleep-promise')
const { getMapping } = require('../../../src/es/utils')
const { deleteIndex } = require('../../../src/es/utils')
const { searchOneDocument } = require('../../../src/es/utils')
const { createStorageWriteEs } = require('../../../src')
const { Client } = require('@elastic/elasticsearch')
const toCanonicalJson = require('canonical-json')
const { esFilterSubledgerName } = require('../../../src/es/es-query-builder')
const { esAndFilters } = require('../../../src/es/es-query-builder')
const { esFilterBySeqNo } = require('../../../src/es/es-query-builder')

const URL_ES = process.env.URL_ES || 'http://localhost:9200'
let esClient
const index = 'storage-integration-write-storage-txs'

async function deleteIntegrationTestIndices () {
  try {
    await deleteIndex(esClient, index)
  } catch (err) {} // the index probably doesn't exist, that's cool
}

beforeAll(async () => {
  esClient = new Client({ node: URL_ES })
})

beforeEach(async () => {
  jest.setTimeout(1000 * 60 * 4)
  await deleteIntegrationTestIndices()
})

const imetaMapping = {
  properties: {
    seqNo: {
      type: 'integer'
    },
    subledger: {
      type: 'keyword'
    }
  }
}

describe('writing txdata to elasticsearch', () => {
  it('should write and find sample tx representation', async () => {
    const writeStorage = await createStorageWriteEs(esClient, index, 0)
    await writeStorage.addTx('domain', 1, 'newformat', { what: 'ever1234', you: 'wish' })
    await sleep(1000)
    // assert
    const txBar = await searchOneDocument(esClient, index, {
      term: {
        'idata.newformat.idata.what': {
          value: 'ever1234'
        }
      }
    })
    expect(toCanonicalJson(txBar)).toBe(toCanonicalJson({
      imeta: { subledger: 'domain', seqNo: 1 },
      idata: {
        newformat: { idata: { what: 'ever1234', you: 'wish' }, imeta: { subledger: 'domain', seqNo: 1 } }
      }
    }))
  })

  it('should persist multiple transaction formats', async () => {
    // arrange
    const writeStorage = await createStorageWriteEs(esClient, index, 0)

    // act
    await writeStorage.addTx('domain', 1, 'format-foo', { what: 'ever1234', you: 'wish' })
    await writeStorage.addTx('domain', 1, 'format-bar', { hello: 'world', world: 'hello' })
    await sleep(1000)

    // assert
    const txBar = await searchOneDocument(esClient, index, {
      term: {
        'idata.format-bar.idata.hello': {
          value: 'world'
        }
      }
    })
    expect(toCanonicalJson(txBar)).toBe(toCanonicalJson({
      imeta: { subledger: 'domain', seqNo: 1 },
      idata: {
        'format-foo': { idata: { what: 'ever1234', you: 'wish' }, imeta: { subledger: 'domain', seqNo: 1 } },
        'format-bar': { idata: { world: 'hello', hello: 'world' }, imeta: { subledger: 'domain', seqNo: 1 } }
      }
    }))
  })

  it('should create default mapping for default and required "meta" format', async () => {
    // arrange
    const testIndex = 'integration-test-expect-default-mapping'
    try {
      await deleteIndex(esClient, testIndex)
    } catch (e) {}
    await createStorageWriteEs(esClient, testIndex, 0)

    // assert
    const mapping = await getMapping(esClient, testIndex)
    const expectedBody = toCanonicalJson({
        [testIndex]: {
          mappings: {
            properties: {
              imeta: {
                properties: {
                  seqNo: {
                    type: 'integer'
                  },
                  subledger: {
                    type: 'keyword'
                  }
                }
              }
            }
          }
        }
      }
    )
    expect(toCanonicalJson(mapping.body)).toBe(expectedBody)
  })

  it('should create mappings for two transaction formats', async () => {
    // arrange
    const testIndex = 'index-test-mappings'
    try {
      await deleteIndex(esClient, testIndex)
    } catch (e) {}
    const esStorage = await createStorageWriteEs(esClient, testIndex, 0)
    const mappingFoo = {
      aaa: { type: 'integer' }
    }
    await sleep(1000)

    // act
    await esStorage.setFormatMappings('format-foo', mappingFoo)

    // assert
    const mapping = await getMapping(esClient, testIndex)

    expect(toCanonicalJson(mapping.body)).toBe(toCanonicalJson({
        [testIndex]: {
          mappings: {
            properties: {
              idata: {
                properties: {
                  'format-foo': {
                    properties: {
                      idata: {
                        properties: {
                          aaa: {
                            type: 'integer'
                          }
                        }
                      },
                      imeta: imetaMapping
                    }
                  }
                }
              },
              imeta: imetaMapping
            }
          }
        }
      }
    ))

    const mappingBar = {
      bbb: { type: 'keyword' }
    }
    await sleep(1000)

    // act
    await esStorage.setFormatMappings('format-bar', mappingBar)

    // assert
    const mappingNew = await getMapping(esClient, testIndex)
    expect(toCanonicalJson(mappingNew.body)).toBe(toCanonicalJson({
        [testIndex]: {
          mappings: {
            properties: {
              idata: {
                properties: {
                  'format-foo': {
                    properties: {
                      idata: {
                        properties: {
                          aaa: {
                            type: 'integer'
                          }
                        }
                      },
                      imeta: imetaMapping
                    }
                  },
                  'format-bar': {
                    properties: {
                      idata: {
                        properties: {
                          bbb: {
                            type: 'keyword'
                          }
                        }
                      },
                      imeta: imetaMapping
                    }
                  }
                }
              },
              imeta: imetaMapping
            }
          }
        }
      }
    ))

    await deleteIndex(esClient, testIndex)
  })

  it('should create mapping for a tx format, then add another field', async () => {
    // arrange
    const testIndex = 'index-test-mappings'
    try {
      await deleteIndex(esClient, testIndex)
    } catch (e) {}
    const esStorage = await createStorageWriteEs(esClient, testIndex, 0)
    // act
    await esStorage.setFormatMappings('format-foo', { aaa: { type: 'integer' } })
    await esStorage.setFormatMappings('format-foo', { bbb: { type: 'keyword' } })

    // assert
    const mappingNew = await getMapping(esClient, testIndex)
    expect(toCanonicalJson(mappingNew.body)).toBe(toCanonicalJson({
      [testIndex]: {
        mappings: {
          properties: {
            idata: {
              properties: {
                'format-foo': {
                  properties: {
                    idata: {
                      properties: {
                        aaa: {
                          type: 'integer'
                        },
                        bbb: {
                          type: 'keyword'
                        }
                      }
                    },
                    imeta: imetaMapping
                  }
                }
              }
            },
            imeta: imetaMapping
          }
        }
      }
    }))

    await deleteIndex(esClient, testIndex)
  })

  it('should delete subledger transactions above seqNo', async () => {
    // arrange
    const writeStorage = await createStorageWriteEs(esClient, index, 0)

    // act
    await writeStorage.addTx('domain', 1, 'format-bar', { hello: 'world1' })
    await writeStorage.addTx('domain', 2, 'format-bar', { hello: 'world2' })
    await writeStorage.addTx('domain', 3, 'format-bar', { hello: 'world3' })
    await writeStorage.addTx('domain', 4, 'format-bar', { hello: 'world4' })
    await writeStorage.addTx('domain', 5, 'format-bar', { hello: 'world5' })

    await writeStorage.addTx('config', 5, 'format-bar', { hello: 'world5' })
    await writeStorage.addTx('pool', 5, 'format-bar', { hello: 'world5' })
    await sleep(1000)


    const domainTx3 = await searchOneDocument(esClient, index, esAndFilters(esFilterBySeqNo(3), esFilterSubledgerName('domain')))
    expect(domainTx3).toBeDefined()

    await writeStorage.deleteTxsByGteSeqNo('domain', 3)
    await sleep(1000)

    // domain ledger txs should be deleted by seqno
    expect(await searchOneDocument(esClient, index, esAndFilters(esFilterBySeqNo(3), esFilterSubledgerName('domain')))).toBeNull()
    expect(await searchOneDocument(esClient, index, esAndFilters(esFilterBySeqNo(4), esFilterSubledgerName('domain')))).toBeNull()
    expect(await searchOneDocument(esClient, index, esAndFilters(esFilterBySeqNo(5), esFilterSubledgerName('domain')))).toBeNull()

    // other subledgers should be untouched
    expect(await searchOneDocument(esClient, index, esAndFilters(esFilterBySeqNo(5), esFilterSubledgerName('pool')))).toBeDefined()
    expect(await searchOneDocument(esClient, index, esAndFilters(esFilterBySeqNo(5), esFilterSubledgerName('config')))).toBeDefined()
  })
})
