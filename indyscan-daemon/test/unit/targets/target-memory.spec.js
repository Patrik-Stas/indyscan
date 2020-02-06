const {createIteratorGuided} = require('../../../src/iterators/iterator-guided')
const {createTargetMemory} = require('../../../src/targets/target-memory')
let dataspace = {
  domain: {},
  pool: {},
  config: {}
}
let target = createTargetMemory({id: 'inmem-target', dataspace})

describe('basic inmemory target testsuite', () => {
  it('should store various formats for multiple ledgers', async () => {
    target.addTxData('domain', 1, 'format-foo', {foo: 'foo1'})
    target.addTxData('pool', 1, 'format-pool', {pool: 'pooldata'})
    target.addTxData('config', 1, 'format-config', {config: 'configdata'})
    target.addTxData('domain', 1, 'format-bar', {bar: 'bar-data'})
    target.addTxData('domain', 2, 'format-foo', {foo: 'foo2'})
    target.addTxData('domain', 4, 'format-foo', {foo: 'foo4'})

    let expectedData = {
      'domain': {
        '1': {'format-foo': {'foo': 'foo1'}, 'format-bar': {'bar': 'bar-data'}},
        '2': {'format-foo': {'foo': 'foo2'}},
        '4': {'format-foo': {'foo': 'foo4'}}
      },
      'pool': {'1': {'format-pool': {'pool': 'pooldata'}}},
      'config': {'1': {'format-config': {'config': 'configdata'}}}
    }
    expect(JSON.stringify(dataspace)).toBe(JSON.stringify(expectedData))
  })

})
