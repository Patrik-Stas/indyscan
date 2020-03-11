/* eslint-env jest */
const txPoolUpgrade = require('indyscan-storage/test/resource/sample-txs/tx-config-pool-upgrade')
const { createTransformerOriginal2Expansion } = require('../../../../src/transformers/transformer-original2expansion')

const processor = createTransformerOriginal2Expansion({ id: 'foo', sourceLookups: undefined })

describe('config/pool-upgrade transaction transformations', () => {
  it('should not modify config POOL_UPGRADE transaction', async () => {
    const { processedTx } = await processor.processTx(txPoolUpgrade, 'CONFIG')
    expect(processedTx.txn.typeName).toBe('POOL_UPGRADE')
    expect(Array.isArray(processedTx.txn.data.schedule)).toBeTruthy()
    expect(processedTx.txn.data.schedule.length).toBe(13)
    const scheduleHash = '5mYsynpwzx3muLWYP5ZmqWK8oZtP5k7xj5w85NDKJSM6'
    const scheduleRecords = processedTx.txn.data.schedule.filter(r => r.scheduleKey === scheduleHash)
    expect(scheduleRecords.length).toBe(1)
    expect(scheduleRecords[0].scheduleKey).toBe('5mYsynpwzx3muLWYP5ZmqWK8oZtP5k7xj5w85NDKJSM6')
    expect(scheduleRecords[0].scheduleTime).toBe('2019-11-11T10:05:00.555000-07:00')
    expect(processedTx.txnMetadata.txnTime).toBe('2019-11-11T14:23:24.000Z')
  })
})
