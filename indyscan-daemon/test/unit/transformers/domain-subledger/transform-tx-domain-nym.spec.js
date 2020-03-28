/* eslint-env jest */
const txNym = require('indyscan-storage/test/resource/sample-txs/tx-domain-nym-noraw')
const txNymAgent = require('indyscan-storage/test/resource/sample-txs/tx-domain-nym-agent')
const txNymEndpoint = require('indyscan-storage/test/resource/sample-txs/tx-domain-nym-endpoint')
const txNymUrl = require('indyscan-storage/test/resource/sample-txs/tx-domain-nym-url')
const txNymInvaliJson = require('indyscan-storage/test/resource/sample-txs/tx-domain-nym-invalid-json')
const txNymLastUpdated = require('indyscan-storage/test/resource/sample-txs/tx-domain-nym-last-updated')
const _ = require('lodash')
const { createTransformerOriginal2Expansion } = require('../../../../src/transformers/transformer-original2expansion')

const processor = createTransformerOriginal2Expansion({ sourceLookups: undefined })

describe('domain/nym transaction transformations', () => {
  it('should add typeName and subledger for domain NYM transaction', async () => {
    const tx = _.cloneDeep(txNym)
    const { processedTx } = await processor.processTx(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txNym))
    expect(processedTx.txn.typeName).toBe('NYM')
    expect(processedTx.txnMetadata.txnTime).toBe('2019-11-26T19:32:01.000Z')
  })

  it('should add typeName and subledger for domain NYM transaction with agent in raw data', async () => {
    const tx = _.cloneDeep(txNymAgent)
    const { processedTx } = await processor.processTx(tx, 'DOMAIN')
    expect(processedTx.txn.typeName).toBe('NYM')
    expect(processedTx.txn.data.endpoint).toBe('http://localhost:8080/agency')
  })

  it('should add typeName and subledger for domain NYM transaction with agent in raw data', async () => {
    const tx = _.cloneDeep(txNymEndpoint)
    const { processedTx } = await processor.processTx(tx, 'DOMAIN')
    expect(processedTx.txn.typeName).toBe('NYM')
    expect(processedTx.txn.data.endpoint).toBe('https://bayer.agent.develop.ssigate.ch/api/v1/inbox')
  })

  it('should add typeName and subledger for domain NYM transaction with agent in raw data', async () => {
    const tx = _.cloneDeep(txNymUrl)
    const { processedTx } = await processor.processTx(tx, 'DOMAIN')
    expect(processedTx.txn.typeName).toBe('NYM')
    expect(processedTx.txn.data.endpoint).toBe('https://bayer.agent.develop.ssigate.ch/api/v2/inbox')
  })

  it('should add typeName and subledger for domain NYM transaction with agent in raw data', async () => {
    const tx = _.cloneDeep(txNymInvaliJson)
    const { processedTx } = await processor.processTx(tx, 'DOMAIN')
    expect(processedTx.txn.typeName).toBe('NYM')
    expect(processedTx.txn.data.endpoint).toBeUndefined()
    expect(processedTx.txn.data.raw).toBe('foobar')
  })

  it('should add typeName and subledger for domain NYM transaction with last_upated in raw data', async () => {
    const tx = _.cloneDeep(txNymLastUpdated)
    const { processedTx } = await processor.processTx(tx, 'DOMAIN')
    expect(processedTx.txn.typeName).toBe('NYM')
    expect(processedTx.txn.data.lastUpdated).toBe(1572956741.1868246)
  })
})
