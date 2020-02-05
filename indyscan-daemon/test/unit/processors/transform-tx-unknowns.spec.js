/* eslint-env jest */
const txUnknown = require('indyscan-storage/test/resource/sample-txs/tx-madeup-unknown')
const _ = require('lodash')
const {createProcessorExpansion} = require('../../../src/processors/processor-expansion')

let processor = createProcessorExpansion({id:'foo', sourceLookups: undefined})

describe('unrecognized transaction transformations', () => {
  it('should not modify original argument', async () => {
    const tx = _.cloneDeep(txUnknown)
    await processor.transformTx(tx)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txUnknown))
  })

  it('should process unrecognized type of transaction and set typeName and ledger to UNKNOWN', async () => {
    const tx = _.cloneDeep(txUnknown)
    let transformed = await processor.transformTx(tx)
    expect(transformed.txn.typeName).toBe('UNKNOWN')
    expect(transformed.subledger.code).toBe('UNKNOWN')
    expect(transformed.subledger.name).toBe('UNKNOWN')
    expect(transformed.txn.data.dest).toBe('7WhrDsysVnBZHtjwwFAzVSmyGA1jpnBbmqBgs4q9wk9g')
    expect(transformed.txnMetadata.txnTime).toBe('2019-11-08T21:40:59.000Z')
  })

  it('should process unrecognized type of transaction and return unmodified data', async () => {
    const tx = _.cloneDeep(txUnknown)
    let transformed = await processor.transformTx(tx)
    expect(transformed.txn.protocolVersion).toBe(2)
    expect(transformed.txn.type).toBe('424242')
    expect(transformed.txnMetadata.txnTime).toBe('2019-11-08T21:40:59.000Z')
    expect(transformed.txnMetadata.seqNo).toBe(141)
    expect(transformed.txn.data.dest).toBe('7WhrDsysVnBZHtjwwFAzVSmyGA1jpnBbmqBgs4q9wk9g')
    expect(transformed.txn.data.foobar).toBe('something')
    expect(transformed.txn.metadata.from).toBe('CwzYfKJZdnYJXAR2jtcbLY')
    expect(transformed.txn.metadata.digest).toBe('0893f92c17af7bc5e4ecad64ab83a641c3e9e830cf96d7856ed4d813f7ea3e8c')
  })

  it('should not modify original argument', async () => {
    const tx = _.cloneDeep(txUnknown)
    await processor.transformTx(tx)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txUnknown))
  })
})
