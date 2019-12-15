/* eslint-env jest */
const { createEsTxTransform } = require('../../../src/transformation/transform-tx')
const txAuthorAgreement = require('../../resource/sample-txs/tx-config-txn-author-agreement')
const txAuthorAgreementAml = require('../../resource/sample-txs/tx-config-txn-author-agreement-aml')
const _ = require('lodash')

let esTransform = createEsTxTransform((seqno) => {throw Error(`Domain tx lookup seqno=${seqno } was not expected.`)})

const CONFIG_LEDGER_ID = '2'

describe('config/ta transaction transformations', () => {
  it('should add typeName and subledger for config TXN_AUTHOR_AGREEMENT transaction', async () => {
    const tx = _.cloneDeep(txAuthorAgreement)
    let transformed = await esTransform(tx, 'CONFIG')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAuthorAgreement)) // check passed tx was not modified
    expect(transformed.txn.typeName).toBe('TXN_AUTHOR_AGREEMENT')
    expect(transformed.subledger.code).toBe(CONFIG_LEDGER_ID)
    expect(transformed.subledger.name).toBe('CONFIG')
    expect(transformed.txnMetadata.txnTime).toBe('2019-09-16T20:15:53.000Z')
  })

  it('should add typeName and subledger for config TXN_AUTHOR_AGREEMENT_AML transaction', async () => {
    const tx = _.cloneDeep(txAuthorAgreementAml)
    let transformed = await esTransform(tx, 'CONFIG')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAuthorAgreementAml)) // check passed tx was not modified
    expect(transformed.txn.typeName).toBe('TXN_AUTHOR_AGREEMENT_AML')
    expect(transformed.subledger.code).toBe(CONFIG_LEDGER_ID)
    expect(transformed.subledger.name).toBe('CONFIG')
    expect(transformed.txnMetadata.txnTime).toBe('2019-09-16T17:35:45.000Z')
  })
})
