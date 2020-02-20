/* eslint-env jest */
const { createProcessorExpansion } = require('../../../src/processors/processor-expansion')
const txAttribRoleSteward = require('indyscan-storage/test/resource/sample-txs/tx-domain-attrib-role-steward')
const _ = require('lodash')

let processor = createProcessorExpansion({id:'foo', sourceLookups: undefined})

const DOMAIN_LEDGER_ID = '1'

describe('common transformations', () => {
  it('should not modify original argument object', async () => {
    const tx = _.cloneDeep(txAttribRoleSteward)
    await processor.processTx(tx)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAttribRoleSteward))
  })

  it('should return format "indyscan"', async () => {
    const tx = _.cloneDeep(txAttribRoleSteward)
    const {processedTx, format}  = await processor.processTx(tx)
    expect(format).toBe('indyscan')
    expect(processedTx).toBeDefined()
  })

  it('should set typeName', async () => {
    const tx = _.cloneDeep(txAttribRoleSteward)
    const {processedTx}  = await processor.processTx(tx)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAttribRoleSteward))
    expect(processedTx.txn.typeName).toBe('ATTRIB')
  })

  it('should convert txnMetadata.txnTime to ISO8601', async () => {
    const tx = _.cloneDeep(txAttribRoleSteward)
    const {processedTx}  = await processor.processTx(tx)
    expect(processedTx.txnMetadata.txnTime).toBe('2019-11-27T15:34:07.000Z')
  })

  it('should throw if tx argument is undefined', async () => {
    let threw
    try {
      await processor.processTx(undefined)
    } catch (err) {
      threw = true
    }
    expect(threw).toBeTruthy()
  })

  it('should throw if tx argument is null', async () => {
    let threw
    try {
      await processor.processTx(null)
    } catch (err) {
      threw = true
    }
    expect(threw).toBeTruthy()
  })

  it('should throw if tx argument is empty object', async () => {
    let threw
    try {
      await processor.processTx({})
    } catch (err) {
      threw = true
    }
    expect(threw).toBeTruthy()
  })
})
