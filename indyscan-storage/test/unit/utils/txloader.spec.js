/* eslint-env jest */

import { importFileToStorage } from '../../../src/utils/txloader'
import path from 'path'
const RESOURCE_DIR = path.resolve(__dirname, '../../resource')

function createsSimpleStorage () {
  let txs = []

  function addTx (tx) {
    txs.push(tx)
  }

  return {
    txs,
    addTx
  }
}

describe('basic storage test', () => {
  it('should build transaction filter by txType correctly', async () => {
    const storage = createsSimpleStorage()
    await importFileToStorage(storage, `${RESOURCE_DIR}/txs-test/domain.json`)
    expect(storage.txs[0].rootHash).toBe('Enejxy16re4eva1mehABWpswuaRRbZN1B9sPFHHthZvm')
    expect(storage.txs.length).toBe(300)
  })
})
