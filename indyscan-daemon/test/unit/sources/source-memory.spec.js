/* eslint-env jest */
const { createSourceMemory } = require('../../../src/sources/source-memory')
const { createTargetMemory } = require('../../../src/targets/target-memory')

let target
let txSource

beforeEach(async () => {
  const dataspace = {
    domain: {},
    pool: {},
    config: {}
  }
  target = createTargetMemory({ dataspace })
  txSource = createSourceMemory({ dataspace })
})

describe('basic inmemory target testsuite', () => {
  it('should get subledger tx in selected format', async () => {
    target.addTxData('pool', 1, 'format-pool', { pool: 'pooldata' })
    target.addTxData('config', 1, 'format-config', { config: 'configdata' })
    target.addTxData('domain', 1, 'format-foo', { foo: 'foo1' })
    target.addTxData('domain', 2, 'format-foo', { foo: 'foo2' })
    target.addTxData('domain', 4, 'format-foo', { foo: 'foo4' })

    const txdata = await txSource.getTxData('domain', 1, 'format-foo')
    expect(JSON.stringify(txdata)).toBe(JSON.stringify({ foo: 'foo1' }))
  })

  it('should get subledger highest seqno regardless of format by defaut', async () => {
    target.addTxData('pool', 1, 'format-pool', { pool: 'pooldata' })
    target.addTxData('domain', 1, 'format-foo', { foo: 'foo1' })
    target.addTxData('domain', 2, 'format-foo', { foo: 'foo2' })
    target.addTxData('domain', 4, 'format-foo', { foo: 'foo4' })

    expect(await txSource.getHighestSeqno('domain')).toBe(4)
    expect(await txSource.getHighestSeqno('pool')).toBe(1)
    expect(await txSource.getHighestSeqno('config')).toBe(0)

    target.addTxData('domain', 500, 'format-foo', { foo: 'foo500' })
    expect(await txSource.getHighestSeqno('domain')).toBe(500)
  })

  it('should get subledger highest seqno regardless of format if querying full format', async () => {
    target.addTxData('pool', 1, 'format-pool', { pool: 'pooldata' })
    target.addTxData('domain', 1, 'format-foo', { foo: 'foo1' })
    target.addTxData('domain', 2, 'format-foo', { foo: 'foo2' })
    target.addTxData('domain', 4, 'format-foo', { foo: 'foo4' })

    expect(await txSource.getHighestSeqno('domain', 'full')).toBe(4)
    expect(await txSource.getHighestSeqno('pool', 'full')).toBe(1)
    expect(await txSource.getHighestSeqno('config', 'full')).toBe(0)

    target.addTxData('domain', 500, 'format-foo', { foo: 'foo500' })
    expect(await txSource.getHighestSeqno('domain', 'full')).toBe(500)
  })

  it('should get subledger highest seqno in particular format', async () => {
    target.addTxData('pool', 1, 'format-pool', { pool: 'pooldata' })
    target.addTxData('domain', 1, 'format-foo', { foo: 'foo1' })
    target.addTxData('domain', 2, 'format-foo', { foo: 'foo2' })
    target.addTxData('domain', 4, 'format-foo', { foo: 'foo4' })
    target.addTxData('domain', 1, 'format-bar', { bar: 'bar1' })

    expect(await txSource.getHighestSeqno('domain', 'format-bar')).toBe(1)
    expect(await txSource.getHighestSeqno('domain', 'format-foo')).toBe(4)
    expect(await txSource.getHighestSeqno('pool', 'format-pool')).toBe(1)
    expect(await txSource.getHighestSeqno('config', 'full', 'unknown-format')).toBe(0)

    target.addTxData('domain', 500, 'format-foo', { foo: 'foo500' })
    expect(await txSource.getHighestSeqno('domain', 'format-foo')).toBe(500)
  })
})
