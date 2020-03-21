/* eslint-env jest */
const txAuthorAgreement = require('indyscan-storage/test/resource/sample-txs/tx-config-txn-author-agreement')
const txAuthorAgreementAml = require('indyscan-storage/test/resource/sample-txs/tx-config-txn-author-agreement-aml')
const _ = require('lodash')
const { createTransformerOriginal2Expansion } = require('../../../../src/transformers/transformer-original2expansion')

const processor = createTransformerOriginal2Expansion({ id: 'foo', sourceLookups: undefined })

describe('config/ta transaction transformations', () => {
  it('should add typeName and subledger for config TXN_AUTHOR_AGREEMENT transaction', async () => {
    const tx = _.cloneDeep(txAuthorAgreement)
    const { processedTx } = await processor.processTx(tx, 'CONFIG')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAuthorAgreement)) // check passed tx was not modified
    expect(processedTx.txn.typeName).toBe('TXN_AUTHOR_AGREEMENT')
    expect(processedTx.txnMetadata.txnTime).toBe('2019-09-16T20:15:53.000Z')
  })

  it('should add typeName and subledger for config TXN_AUTHOR_AGREEMENT_AML transaction', async () => {
    const tx = _.cloneDeep(txAuthorAgreementAml)
    const { processedTx } = await processor.processTx(tx, 'CONFIG')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAuthorAgreementAml)) // check passed tx was not modified
    expect(processedTx.txn.typeName).toBe('TXN_AUTHOR_AGREEMENT_AML')
    expect(processedTx.txnMetadata.txnTime).toBe('2019-09-16T17:35:45.000Z')
  })
})
