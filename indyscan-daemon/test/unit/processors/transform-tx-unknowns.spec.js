/* eslint-env jest */
const txUnknown = require('indyscan-storage/test/resource/sample-txs/tx-madeup-unknown')
const _ = require('lodash')
const {createProcessorExpansion} = require('../../../src/processors/processor-expansion')

let processor = createProcessorExpansion({id:'foo', sourceLookups: undefined})

describe('unrecognized transaction transformations', () => {
  it('should not modify original argument', async () => {
    const tx = _.cloneDeep(txUnknown)
    await processor.processTx(tx)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txUnknown))
  })

  it('should process unrecognized type of transaction and set typeName and ledger to UNKNOWN', async () => {
    const tx = _.cloneDeep(txUnknown)
    const {processedTx}  = await processor.processTx(tx)
    expect(processedTx.txn.typeName).toBe('UNKNOWN')
    expect(processedTx.subledger.code).toBe('UNKNOWN')
    expect(processedTx.subledger.name).toBe('UNKNOWN')
    expect(processedTx.txn.data.dest).toBe('7WhrDsysVnBZHtjwwFAzVSmyGA1jpnBbmqBgs4q9wk9g')
    expect(processedTx.txnMetadata.txnTime).toBe('2019-11-08T21:40:59.000Z')
  })

  it('should process unrecognized type of transaction and return unmodified data', async () => {
    const tx = _.cloneDeep(txUnknown)
    const {processedTx}  = await processor.processTx(tx)
    expect(processedTx.txn.protocolVersion).toBe(2)
    expect(processedTx.txn.type).toBe('424242')
    expect(processedTx.txnMetadata.txnTime).toBe('2019-11-08T21:40:59.000Z')
    expect(processedTx.txnMetadata.seqNo).toBe(141)
    expect(processedTx.txn.data.dest).toBe('7WhrDsysVnBZHtjwwFAzVSmyGA1jpnBbmqBgs4q9wk9g')
    expect(processedTx.txn.data.foobar).toBe('something')
    expect(processedTx.txn.metadata.from).toBe('CwzYfKJZdnYJXAR2jtcbLY')
    expect(processedTx.txn.metadata.digest).toBe('0893f92c17af7bc5e4ecad64ab83a641c3e9e830cf96d7856ed4d813f7ea3e8c')
  })

  it('should not modify original argument', async () => {
    const tx = _.cloneDeep(txUnknown)
    await processor.processTx(tx)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txUnknown))
  })
})
