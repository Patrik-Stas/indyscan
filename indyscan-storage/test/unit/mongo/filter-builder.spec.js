/* eslint-env jest */

import { filterByTxTypeNames } from '../../src/mongo/filter-builder'

describe('basic storage test', () => {
  it('should build transaction filter by txType correctly', async () => {
    const txFilter = filterByTxTypeNames(['SCHEMA', 'CLAIM_DEF'])
    expect(JSON.stringify(txFilter)).toBe(JSON.stringify({ '$or': [{ 'txn.type': '101' }, { 'txn.type': '102' }] }))
  })

  it('should build empty filter if no txNames are passed', async () => {
    const txFilter = filterByTxTypeNames([])
    expect(JSON.stringify(txFilter)).toBe(JSON.stringify({}))
  })
})
