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
    target.addTx('domain', 1, 'format-foo', {foo: 'foo1'})
    target.addTx('pool', 1, 'format-pool', {pool: 'pooldata'})
    target.addTx('config', 1, 'format-config', {config: 'configdata'})
    target.addTx('domain', 1, 'format-bar', {bar: 'bar-data'})
    target.addTx('domain', 2, 'format-foo', {foo: 'foo2'})
    target.addTx('domain', 4, 'format-foo', {foo: 'foo4'})

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
