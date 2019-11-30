/* eslint-env jest */

import { mongoFilterByTxTypeNames } from '../../../src/mongo/filter-builder'

describe('basic storage test', () => {
  it('should build transaction filter by txType correctly', async () => {
    const txFilter = mongoFilterByTxTypeNames(['SCHEMA', 'CLAIM_DEF'])
    expect(JSON.stringify(txFilter)).toBe(JSON.stringify({ '$or': [{ 'txn.type': '101' }, { 'txn.type': '102' }] }))
  })

  it('should build empty filter if no txNames are passed', async () => {
    const txFilter = mongoFilterByTxTypeNames([])
    expect(JSON.stringify(txFilter)).toBe(JSON.stringify({}))
  })
})
