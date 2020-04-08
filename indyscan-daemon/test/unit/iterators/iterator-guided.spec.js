/* eslint-env jest */
const { createTargetMemory } = require('../../../src/targets/target-memory')
const { createIteratorGuided } = require('../../../src/iterators/iterator-guided')
const { createSourceMemory } = require('../../../src/sources/source-memory')

let dataspace1
let dataspace2

let txSource1
let txSource2
let txTarget2

beforeEach(async () => {
  dataspace1 = {
    domain: {
      1: { 'format-foo': { foo: 'foo-data1' }, 'format-bar': { bar: 'bar-data1' } },
      2: { 'format-foo': { foo: 'foo-data2' } },
      3: { 'format-foo': { foo: 'foo-data3' }, 'format-bar': { bar: 'bar-data3' } }
    },
    pool: { 1: { 'format-pool': { pool: 'pooldata' } } },
    config: { 1: { 'format-config': { config: 'configdata' } } }
  }

  dataspace2 = {
    domain: {},
    pool: {},
    config: {}
  }

  txSource1 = createSourceMemory({ dataspace: dataspace1 })
  txSource2 = createSourceMemory({ dataspace: dataspace2 })
  txTarget2 = createTargetMemory({ dataspace: dataspace2 })
})

describe('basic iterator testsuite', () => {
  it('should return the same data if getNextTx called repeatedly without modifying guided storage state', async () => {
    const iterator = createIteratorGuided({ id: 'test-iterator', source: txSource1, sourceSeqNoGuidance: txSource2, guidanceFormat: 'format-foo' })
    const { queryMeta: meta1, queryStatus: queryStatus1, tx: tx1 } = await iterator.getNextTx('domain', 'format-foo')
    expect(queryStatus1).toBe('RESOLUTION_SUCCESS')
    expect(tx1.foo).toBe('foo-data1')
    expect(meta1.format).toBe('format-foo')
    expect(meta1.seqNo).toBe(1)
    expect(meta1.subledger).toBe('domain')

    const { queryMeta: meta1Again, queryStatus: queryStatus2, tx: tx1Again } = await iterator.getNextTx('domain', 'format-foo')
    expect(queryStatus2).toBe('RESOLUTION_SUCCESS')
    expect(tx1Again.foo).toBe('foo-data1')
    expect(meta1Again.format).toBe('format-foo')
    expect(meta1Again.seqNo).toBe(1)
    expect(meta1Again.subledger).toBe('domain')
  })

  it('should return new transaction if guided storage is updated', async () => {
    const iterator = createIteratorGuided({ id: 'test-iterator', source: txSource1, sourceSeqNoGuidance: txSource2, guidanceFormat: 'format-foo' })
    const { tx: tx1, queryStatus: queryStatus1, queryMeta: meta1 } = await iterator.getNextTx('domain', 'format-foo')
    expect(queryStatus1).toBe('RESOLUTION_SUCCESS')
    expect(tx1.foo).toBe('foo-data1')
    expect(meta1.format).toBe('format-foo')
    expect(meta1.seqNo).toBe(1)
    expect(meta1.subledger).toBe('domain')

    txTarget2.addTxData('domain', 1, 'format-foo', tx1)
    const { tx: tx2, queryStatus: queryStatus2, queryMeta: meta2 } = await iterator.getNextTx('domain', 'format-foo')
    expect(queryStatus2).toBe('RESOLUTION_SUCCESS')
    expect(tx2.foo).toBe('foo-data2')
    expect(meta2.format).toBe('format-foo')
    expect(meta2.seqNo).toBe(2)
    expect(meta2.subledger).toBe('domain')
  })

  it('should return the same data if guided storage contains new transaction in different format', async () => {
    const iterator = createIteratorGuided({ id: 'test-iterator', source: txSource1, sourceSeqNoGuidance: txSource2, guidanceFormat: 'format-foo' })
    const { tx: tx1, queryStatus: queryStatus1, queryMeta: meta1 } = await iterator.getNextTx('domain', 'format-foo')
    expect(queryStatus1).toBe('RESOLUTION_SUCCESS')
    expect(tx1.foo).toBe('foo-data1')
    expect(meta1.format).toBe('format-foo')
    expect(meta1.seqNo).toBe(1)
    expect(meta1.subledger).toBe('domain')

    txTarget2.addTxData('domain', 1, 'format-bar', tx1)
    const { tx: tx2, queryStatus: queryStatus2, queryMeta: meta2 } = await iterator.getNextTx('domain', 'format-foo')
    expect(queryStatus2).toBe('RESOLUTION_SUCCESS')
    expect(tx2.foo).toBe('foo-data1')
    expect(meta2.format).toBe('format-foo')
    expect(meta2.seqNo).toBe(1)
    expect(meta2.subledger).toBe('domain')
  })

  it('should return status CURRENTLY_EXHAUSTED with query metadata if no next transaction available', async () => {
    const iterator = createIteratorGuided({ id: 'test-iterator', source: txSource1, sourceSeqNoGuidance: txSource2, guidanceFormat: 'format-pool' })
    const { tx: tx1, queryStatus: queryStatus1, queryMeta: meta1 } = await iterator.getNextTx('pool', 'format-pool')
    expect(queryStatus1).toBe('RESOLUTION_SUCCESS')
    expect(tx1.pool).toBe('pooldata')
    expect(meta1.format).toBe('format-pool')
    expect(meta1.seqNo).toBe(1)
    expect(meta1.subledger).toBe('pool')

    txTarget2.addTxData('pool', 1, 'format-pool', tx1)

    const { tx, queryStatus: queryStatus2, queryMeta: meta2 } =await iterator.getNextTx('pool', 'format-pool')
    expect(queryStatus2).toBe('CURRENTLY_EXHAUSTED')
    expect(tx).toBeUndefined()
    expect(tx1.pool).toBe('pooldata')
    expect(meta2.format).toBe('format-pool')
    expect(meta2.seqNo).toBe(2)
    expect(meta2.subledger).toBe('pool')
  })

  it('should return status CANT_DETERMINE_SEQNO_TO_QUERY with known query metadata if guiding storage fails', async () => {
    const iterator = createIteratorGuided({ id: 'test-iterator', source: txSource1, sourceSeqNoGuidance: "FOOBAR", guidanceFormat: 'format-pool' })
    const { tx, queryStatus, queryMeta} = await iterator.getNextTx('pool', 'format-pool')
    expect(queryStatus).toBe('CANT_DETERMINE_SEQNO_TO_QUERY')
    expect(tx).toBeUndefined()
    expect(queryMeta.format).toBe('format-pool')
    expect(queryMeta.subledger).toBe('pool')
  })

  it('should return status RESOLUTION_ERROR with query metadata if no next transaction available', async () => {
    const iterator = createIteratorGuided({ id: 'test-iterator', source: "FOOBAR", sourceSeqNoGuidance: txSource2, guidanceFormat: 'format-pool' })
    const { tx, queryStatus, queryMeta} = await iterator.getNextTx('pool', 'format-pool')
    expect(queryStatus).toBe('RESOLUTION_ERROR')
    expect(tx).toBeUndefined()
    expect(queryMeta.format).toBe('format-pool')
    expect(queryMeta.seqNo).toBe(1)
    expect(queryMeta.subledger).toBe('pool')
  })
})
