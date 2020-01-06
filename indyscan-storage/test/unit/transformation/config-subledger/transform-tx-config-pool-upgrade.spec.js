/* eslint-env jest */
const { createIndyscanTransform } = require('../../../../src/transformation/transform-tx')
const txPoolUpgrade = require('../../../resource/sample-txs/tx-config-pool-upgrade')
const txPoolUpgradeCorrupted = require('../../../resource/sample-txs/tx-config-pool-upgrade-corrupted')

let esTransform = createIndyscanTransform((seqno) => { throw Error(`Domain tx lookup seqno=${seqno} was not expected.`) })

const CONFIG_LEDGER_ID = '2'

describe('config/pool-upgrade transaction transformations', () => {
  it('should not modify config POOL_UPGRADE transaction', async () => {
    let transformed = await esTransform(txPoolUpgrade, 'CONFIG')
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

  it('should process corrupted tx stagingnet/config/24933 with wrong schedule time', async () => {
    let transformed = await esTransform(txPoolUpgradeCorrupted, 'CONFIG')
    expect(transformed.txn.typeName).toBe('POOL_UPGRADE')
    expect(Array.isArray(transformed.txn.data.schedule)).toBeTruthy()
    expect(transformed.txn.data.schedule.length).toBe(15)
    let scheduleHash = 'BLu5t8JVbpHrRrocSx1HtMqJC8xruDLisaYZMZverkBs'
    let scheduleRecords = transformed.txn.data.schedule.filter(r => r.scheduleKey === scheduleHash)
    expect(scheduleRecords.length).toBe(1)
    expect(scheduleRecords[0].scheduleKey).toBe('BLu5t8JVbpHrRrocSx1HtMqJC8xruDLisaYZMZverkBs')
    expect(scheduleRecords[0].scheduleTime).toBe('2019-07-15T10:11:00.555000-06:00')
  })
})
