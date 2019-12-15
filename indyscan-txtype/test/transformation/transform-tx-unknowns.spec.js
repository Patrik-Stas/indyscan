/* eslint-env jest */
const { createEsTxTransform } = require('../../src/transformation/transform-tx')
const txUnknown = require('../resource/sample-txs/tx-madeup-unknown')
const _ = require('lodash')

let esTransform = createEsTxTransform((seqno) => {throw Error(`Domain tx lookup seqno=${seqno } was not expected.`)})

describe('unrecognized transaction transformations', () => {
  it('should add typeName and subledger for unknown domain transaction', async () => {
    const tx = _.cloneDeep(txUnknown)
    let transformed = await esTransform(tx)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txUnknown))
    expect(transformed.txn.typeName).toBe('UNKNOWN')
    expect(transformed.txn.data.dest).toBe('7WhrDsysVnBZHtjwwFAzVSmyGA1jpnBbmqBgs4q9wk9g')
    expect(transformed.subledger.code).toBe('UNKNOWN')
    expect(transformed.subledger.name).toBe('UNKNOWN')
    expect(transformed.txnMetadata.txnTime).toBe('2019-11-08T21:40:59.000Z')
  })
})
