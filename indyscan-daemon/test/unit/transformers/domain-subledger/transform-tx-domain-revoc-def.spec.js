/* eslint-env jest */
const txRevocDef = require('indyscan-storage/test/resource/sample-txs/tx-domain-revoc-reg-def')
const _ = require('lodash')
const { createTransformerOriginal2Expansion } = require('../../../../src/transformers/transformer-original2expansion')

const processor = createTransformerOriginal2Expansion({ sourceLookups: undefined })

describe('domain/revoc-dev transaction transformations', () => {
  it('should add typeName and subledger for domain REVOC_REG_DEF transaction', async () => {
    const tx = _.cloneDeep(txRevocDef)
    const { processedTx } = await processor.processTx(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txRevocDef))
    expect(processedTx.txn.typeName).toBe('REVOC_REG_DEF')
    expect(processedTx.txnMetadata.txnTime).toBe('2019-11-26T11:23:55.000Z')
  })
})
