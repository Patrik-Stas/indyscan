/* eslint-env jest */
const txAuthRule = require('indyscan-storage/test/resource/sample-txs/tx-config-auth-rule')
const _ = require('lodash')
const {createProcessorExpansion} = require('../../../../src/processors/processor-expansion')

let processor = createProcessorExpansion({id:'foo', sourceLookups: undefined})

const CONFIG_LEDGER_ID = '2'

describe('config/auth-rule transaction transformations', () => {
  it('should add typeName and subledger for config AUTH_RULE transaction', async () => {
    const tx = _.cloneDeep(txAuthRule)
    const {processedTx}  = await processor.processTx(tx, 'CONFIG')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAuthRule)) // check passed tx was not modified
    expect(processedTx.txn.typeName).toBe('AUTH_RULE')
    expect(processedTx.subledger.code).toBe(CONFIG_LEDGER_ID)
    expect(processedTx.subledger.name).toBe('CONFIG')
    expect(processedTx.txnMetadata.txnTime).toBe('2019-11-18T22:20:12.000Z')
  })
})
