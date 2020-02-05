const {createTargetMemory} = require('../../../src/targets/target-memory')
const {createIteratorGuided} = require('../../../src/iterators/iterator-guided')
const {createSourceMemory} = require('../../../src/sources/source-memory')
let dataspace1 = {
  'domain': {
    '1': {'format-foo': {'foo': 'foo-data1'}, 'format-bar': {'bar': 'bar-data1'}},
    '2': {'format-foo': {'foo': 'foo-data2'}},
    '3': {'format-foo': {'foo': 'foo-data3'}, 'format-bar': {'bar': 'bar-data3'}},
    '4': {'format-foo': {'foo': 'foo-data4'}}
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
    let tx1 = await iterator.getTx('domain', 'format-foo')
    expect(tx1.foo).toBe('foo-data1')
    tx1 = await iterator.getTx('domain', 'format-foo')
    expect(tx1.foo).toBe('foo-data1')

    txTarget2.addTx('domain', 1, 'processed', tx1)
    let tx2 = await iterator.getTx('domain', 'format-foo')
    expect(tx2.foo).toBe('foo-data2')

    txTarget2.addTx('domain', 2, 'processed-different', tx2)
    let tx3 = await iterator.getTx('domain', 'format-bar')
    expect(tx3.bar).toBe('bar-data3')
  })

})
