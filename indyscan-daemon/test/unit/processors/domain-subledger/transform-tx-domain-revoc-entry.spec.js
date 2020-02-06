/* eslint-env jest */
const txRevocEntry = require('indyscan-storage/test/resource/sample-txs/tx-domain-revoc-reg-entry')
const _ = require('lodash')
const {createProcessorExpansion} = require('../../../../src/processors/processor-expansion')

let processor = createProcessorExpansion({id:'foo', sourceLookups: undefined})

const DOMAIN_LEDGER_ID = '1'

describe('domain/revoc-entry transaction transformations', () => {
  it('should add typeName and subledger for domain REVOC_REG_ENTRY transaction', async () => {
    const tx = _.cloneDeep(txRevocEntry)
    const {processedTx}  = await processor.processTx(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txRevocEntry))
    expect(processedTx.txn.typeName).toBe('REVOC_REG_ENTRY')
    expect(processedTx.subledger.code).toBe(DOMAIN_LEDGER_ID)
    expect(processedTx.subledger.name).toBe('DOMAIN')
    expect(processedTx.txnMetadata.txnTime).toBe('2019-11-25T17:17:41.000Z')
  })
})
