const {createTargetElasticsearch} = require('../../../src/targets/target-elasticsearch')
const sleep = require('sleep-promise')
const {createSourceElasticsearch} = require('../../../src/sources/source-elasticsearch')
const {Client} = require('@elastic/elasticsearch')
const toCanonicalJson = require('canonical-json')

const URL_ES = process.env.URL_ES || 'http://localhost:9200'
const index = 'txs-integrationtest-daemon-target-source'
let esClient

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
  await deleteIntegrationTestIndices()
})

afterEach(async () => {
  await deleteIntegrationTestIndices()
})

describe('integration for target elasticsearch', () => {
  it('should store transaction to elasticsearch', async () => {
    let target = await createTargetElasticsearch({id: 'foo', url: 'http://localhost:9200', index, replicas: 0})
    let source = await createSourceElasticsearch({id: 'foo', url: 'http://localhost:9200', index})
    await target.addTxData('domain', 1, 'format-foo', {'foo': 'foo1'})
    await target.addTxData('domain', 1, 'format-bar', {'bar': 'bar-data'})
    await target.addTxData('domain', 2, 'format-foo', {'foo': 'foo1'})
    await target.addTxData('config', 1, 'format-foo', {'foo': 'foo1-config'})
    await target.addTxData('pool', 1, 'format-foo', {'foo': 'foo1-configd'})
    await target.addTxData('pool', 123, 'format-bazz', {'foo': 'foo1-configd'})

    await sleep(1000)
    //
    // let tx1 = await source.getTxData('domain', 1, 'format-foo')
    // expect(toCanonicalJson(tx1)).toBe(toCanonicalJson({idata: {'foo': 'foo1'}, imeta: {seqNo: 1, subledger: 'domain'}}))
    //
    // let h1 = await source.getHighestSeqno('domain')
    // expect(h1).toBe(2)
    //
    // let h2 = await source.getHighestSeqno('domain', 'full')
    // expect(h2).toBe(2)
    //
    // let h3 = await source.getHighestSeqno('domain', 'format-foo')
    // expect(h3).toBe(2)

    let h4 = await source.getHighestSeqno('domain', 'format-bar')
    expect(h4).toBe(1)
  })

})
