/* eslint-env jest */
const { createEsTxTransform } = require('../../src/transformation/transform-tx')
const txRevocDef = require('../resource/sample-txs/tx-domain-revoc-reg-def')
const _ = require('lodash')

let esTransform = createEsTxTransform((seqno) => {throw Error(`Domain tx lookup seqno=${seqno } was not expected.`)})

const DOMAIN_LEDGER_ID = '1'

describe('domain/revoc-dev transaction transformations', () => {
  it('should add typeName and subledger for domain REVOC_REG_DEF transaction', async () => {
    const tx = _.cloneDeep(txRevocDef)
    let transformed = await esTransform(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txRevocDef))
    expect(transformed.txn.typeName).toBe('REVOC_REG_DEF')
    expect(transformed.subledger.code).toBe(DOMAIN_LEDGER_ID)
    expect(transformed.subledger.name).toBe('DOMAIN')
    expect(transformed.txnMetadata.txnTime).toBe('2019-11-26T11:23:55.000Z')
  })
})
