/* eslint-env jest */
const txRevocEntry = require('indyscan-storage/test/resource/sample-txs/tx-domain-revoc-reg-entry')
const _ = require('lodash')
const { createTransformerExpansion } = require('../../../../src/transformers/transformer-expansion')

let processor = createTransformerExpansion({ id: 'foo', sourceLookups: undefined })

describe('domain/revoc-entry transaction transformations', () => {
  it('should add typeName and subledger for domain REVOC_REG_ENTRY transaction', async () => {
    const tx = _.cloneDeep(txRevocEntry)
    const { processedTx } = await processor.processTx(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txRevocEntry))
    expect(processedTx.txn.typeName).toBe('REVOC_REG_ENTRY')
    expect(processedTx.txnMetadata.txnTime).toBe('2019-11-25T17:17:41.000Z')
  })
})
