/* eslint-env jest */
const txUnexpected = require('indyscan-storage/test/resource/sample-txs/tx-unexpected')
const _ = require('lodash')
const { createProcessorExpansion } = require('../../../src/processors/processor-expansion')

let processor = createProcessorExpansion({ id: 'foo', sourceLookups: undefined })

describe('failing tx-specific transformations', () => {
  it('should capture transform error information in meta', async () => {
    const tx = _.cloneDeep(txUnexpected)
    const { processedTx } = await processor.processTx(tx)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txUnexpected))
    expect(processedTx.ierror.message).toBe('id.trim is not a function')
    expect(processedTx.ierror.stack).toContain('at roleIdToRoleAction')
  })

  it('should set shared transformation fields even if txType specific transformation fails', async () => {
    const tx = _.cloneDeep(txUnexpected)
    const { processedTx } = await processor.processTx(tx)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txUnexpected))
    expect(processedTx.ierror).toBeDefined()
    expect(processedTx.txnMetadata.txnTime).toBe('2019-11-27T15:34:07.000Z')
    expect(processedTx.txn.typeName).toBe('ATTRIB')
  })

  it('should preserve original tx data if txType specific transformation fails', async () => {
    const tx = _.cloneDeep(txUnexpected)
    const { processedTx } = await processor.processTx(tx)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txUnexpected))
    expect(processedTx.ierror).toBeDefined()
    expect(processedTx.txnMetadata.txnTime).toBe('2019-11-27T15:34:07.000Z')
    expect(processedTx.txn.data.dest).toBe('DkiCRWTKf9JfWobvpBBMqJ')
    expect(processedTx.txn.metadata.from).toBe('DkiCRWTKf9JfWobvpBBMqJ')
    expect(processedTx.txn.metadata.digest).toBe('1081e066bad15fac68a20079019f3939df2cf3a30f6d0aded6b4c0a7109d3926')
    expect(processedTx.rootHash).toBeUndefined()
  })
})
