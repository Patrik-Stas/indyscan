/* eslint-env jest */
const txSchemaDef = require('indyscan-storage/test/resource/sample-txs/tx-domain-schema')
const _ = require('lodash')
const { createTransformerOriginal2Expansion } = require('../../../../src/transformers/transformer-original2expansion')

const processor = createTransformerOriginal2Expansion({ id: 'foo', sourceLookups: undefined })

describe('domain/schema transaction transformations', () => {
  it('should add typeName and subledger for domain SCHEMA transaction', async () => {
    const tx = _.cloneDeep(txSchemaDef)
    const { processedTx } = await processor.processTx(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txSchemaDef))
    expect(processedTx.txn.typeName).toBe('SCHEMA')
    expect(processedTx.txnMetadata.txnTime).toBe('2019-10-14T10:29:45.000Z')
  })
})
