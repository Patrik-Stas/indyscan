/* eslint-env jest */
const txPoolUpgrade = require('indyscan-storage/test/resource/sample-txs/tx-config-pool-upgrade')
const {createProcessorExpansion} = require('../../../../src/processors/processor-expansion')

let processor = createProcessorExpansion({id:'foo', sourceLookups: undefined})

const CONFIG_LEDGER_ID = '2'

describe('config/pool-upgrade transaction transformations', () => {
  it('should not modify config POOL_UPGRADE transaction', async () => {
    let transformed = await processor.transformTx(txPoolUpgrade, 'CONFIG')
    expect(transformed.txn.typeName).toBe('POOL_UPGRADE')
    expect(Array.isArray(transformed.txn.data.schedule)).toBeTruthy()
    expect(transformed.txn.data.schedule.length).toBe(13)
    let scheduleHash = '5mYsynpwzx3muLWYP5ZmqWK8oZtP5k7xj5w85NDKJSM6'
    let scheduleRecords = transformed.txn.data.schedule.filter(r => r.scheduleKey === scheduleHash)
    expect(scheduleRecords.length).toBe(1)
    expect(scheduleRecords[0].scheduleKey).toBe('5mYsynpwzx3muLWYP5ZmqWK8oZtP5k7xj5w85NDKJSM6')
    expect(scheduleRecords[0].scheduleTime).toBe('2019-11-11T10:05:00.555000-07:00')
    expect(transformed.subledger.code).toBe(CONFIG_LEDGER_ID)
    expect(transformed.subledger.name).toBe('CONFIG')
    expect(transformed.txnMetadata.txnTime).toBe('2019-11-11T14:23:24.000Z')
  })
})
