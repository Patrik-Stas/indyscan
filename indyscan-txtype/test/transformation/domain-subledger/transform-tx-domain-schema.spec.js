/* eslint-env jest */
const { createEsTxTransform } = require('../../../src/transformation/transform-tx')
const txSchemaDef = require('../../resource/sample-txs/tx-domain-schema')
const _ = require('lodash')

let esTransform = createEsTxTransform((seqno) => {throw Error(`Domain tx lookup seqno=${seqno } was not expected.`)})

const DOMAIN_LEDGER_ID = '1'

describe('domain/schema transaction transformations', () => {
  it('should add typeName and subledger for domain SCHEMA transaction', async () => {
    const tx = _.cloneDeep(txSchemaDef)
    let transformed = await esTransform(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txSchemaDef))
    expect(transformed.txn.typeName).toBe('SCHEMA')
    expect(transformed.subledger.code).toBe(DOMAIN_LEDGER_ID)
    expect(transformed.subledger.name).toBe('DOMAIN')
    expect(transformed.txnMetadata.txnTime).toBe('2019-10-14T10:29:45.000Z')
  })
})
