const {createTargetMemory} = require('../../../src/targets/target-memory')
const {createIteratorGuided} = require('../../../src/iterators/iterator-guided')
const {createSourceMemory} = require('../../../src/sources/source-memory')
let dataspace1 = {
  'domain': {
    '1': {'format-foo': {'foo': 'foo-data1'}, 'format-bar': {'bar': 'bar-data1'}},
    '2': {'format-foo': {'foo': 'foo-data2'}},
    '3': {'format-foo': {'foo': 'foo-data3'}, 'format-bar': {'bar': 'bar-data3'}},
  },
  'pool': {'1': {'format-pool': {'pool': 'pooldata'}}},
  'config': {'1': {'format-config': {'config': 'configdata'}}}
}

let dataspace2 = {
  domain: {},
  pool: {},
  config: {}
}

let txSource1 = createSourceMemory({id:'inmem1-source', dataspace: dataspace1})
let txSource2 = createSourceMemory({id:'inmem2-source', dataspace: dataspace2})
let txTarget2 = createTargetMemory({id:'inmem2-target', dataspace: dataspace2})

describe('basic iterator testsuite', () => {
  it('should return transactions from storage1 based on highest found seqno in storage2', async () => {
    let iterator = createIteratorGuided({id:"test-iterator", source:txSource1, sourceSeqNoGuidance: txSource2})
    let {tx: tx1, meta: meta1} = await iterator.getNextTx('domain', 'format-foo')
    expect(tx1.foo).toBe('foo-data1')
    expect(meta1.format).toBe('format-foo')
    expect(meta1.seqNo).toBe(1)
    expect(meta1.subledger).toBe('domain')

    let {tx: tx1Again, meta: meta1Again} = await iterator.getNextTx('domain', 'format-foo')
    expect(tx1Again.foo).toBe('foo-data1')
    expect(meta1Again.format).toBe('format-foo')
    expect(meta1Again.seqNo).toBe(1)
    expect(meta1Again.subledger).toBe('domain')

    txTarget2.addTxData('domain', 1, 'processed', tx1)
    let {tx: tx2, meta: meta2} = await iterator.getNextTx('domain', 'format-foo')
    expect(tx2.foo).toBe('foo-data2')
    expect(meta2.format).toBe('format-foo')
    expect(meta2.seqNo).toBe(2)
    expect(meta2.subledger).toBe('domain')


    txTarget2.addTxData('domain', 2, 'processed-different', tx2)
    let {tx: tx3, meta: meta3} = await iterator.getNextTx('domain', 'format-bar')
    expect(tx3.bar).toBe('bar-data3')
    expect(meta3.format).toBe('format-bar')
    expect(meta3.seqNo).toBe(3)
    expect(meta3.subledger).toBe('domain')


    txTarget2.addTxData('domain', 3, 'processed-different', tx2)
    let {tx: tx4} = await iterator.getNextTx('domain', 'format-foo')
    expect(tx4).toBeUndefined()

  })

})
