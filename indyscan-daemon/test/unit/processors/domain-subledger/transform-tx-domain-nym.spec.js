/* eslint-env jest */
const txNym = require('indyscan-storage/test/resource/sample-txs/tx-domain-nym-noraw')
const txNymAgent = require('indyscan-storage/test/resource/sample-txs/tx-domain-nym-agent')
const txNymEndpoint = require('indyscan-storage/test/resource/sample-txs/tx-domain-nym-endpoint')
const txNymUrl = require('indyscan-storage/test/resource/sample-txs/tx-domain-nym-url')
const txNymInvaliJson = require('indyscan-storage/test/resource/sample-txs/tx-domain-nym-invalid-json')
const txNymLastUpdated = require('indyscan-storage/test/resource/sample-txs/tx-domain-nym-last-updated')
const _ = require('lodash')
const {createProcessorExpansion} = require('../../../../src/processors/processor-expansion')

let processor = createProcessorExpansion({id:'foo', sourceLookups: undefined})

const DOMAIN_LEDGER_ID = '1'

describe('domain/nym transaction transformations', () => {
  it('should add typeName and subledger for domain NYM transaction', async () => {
    const tx = _.cloneDeep(txNym)
    let transformed = await processor.transformTx(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txNym))
    expect(transformed.txn.typeName).toBe('NYM')
    expect(transformed.subledger.code).toBe(DOMAIN_LEDGER_ID)
    expect(transformed.subledger.name).toBe('DOMAIN')
    expect(transformed.txnMetadata.txnTime).toBe('2019-11-26T19:32:01.000Z')
  })

  it('should add typeName and subledger for domain NYM transaction with agent in raw data', async () => {
    const tx = _.cloneDeep(txNymAgent)
    let transformed = await processor.transformTx(tx, 'DOMAIN')
    expect(transformed.txn.typeName).toBe('NYM')
    expect(transformed.txn.data.endpoint).toBe('http://localhost:8080/agency')
  })

  it('should add typeName and subledger for domain NYM transaction with agent in raw data', async () => {
    const tx = _.cloneDeep(txNymEndpoint)
    let transformed = await processor.transformTx(tx, 'DOMAIN')
    expect(transformed.txn.typeName).toBe('NYM')
    expect(transformed.txn.data.endpoint).toBe('https://bayer.agent.develop.ssigate.ch/api/v1/inbox')
  })

  it('should add typeName and subledger for domain NYM transaction with agent in raw data', async () => {
    const tx = _.cloneDeep(txNymUrl)
    let transformed = await processor.transformTx(tx, 'DOMAIN')
    expect(transformed.txn.typeName).toBe('NYM')
    expect(transformed.txn.data.endpoint).toBe('https://bayer.agent.develop.ssigate.ch/api/v2/inbox')
  })

  it('should add typeName and subledger for domain NYM transaction with agent in raw data', async () => {
    const tx = _.cloneDeep(txNymInvaliJson)
    let transformed = await processor.transformTx(tx, 'DOMAIN')
    expect(transformed.txn.typeName).toBe('NYM')
    expect(transformed.txn.data.endpoint).toBeUndefined()
    expect(transformed.txn.data.raw).toBe('foobar')
  })

  it('should add typeName and subledger for domain NYM transaction with last_upated in raw data', async () => {
    const tx = _.cloneDeep(txNymLastUpdated)
    let transformed = await processor.transformTx(tx, 'DOMAIN')
    expect(transformed.txn.typeName).toBe('NYM')
    expect(transformed.txn.data.lastUpdated).toBe(1572956741.1868246)
  })
})
