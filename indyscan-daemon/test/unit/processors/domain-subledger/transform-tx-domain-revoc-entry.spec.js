/* eslint-env jest */
const txRevocEntry = require('indyscan-storage/test/resource/sample-txs/tx-domain-revoc-reg-entry')
const _ = require('lodash')
const {createProcessorExpansion} = require('../../../../src/processors/processor-expansion')

let processor = createProcessorExpansion({id:'foo', sourceLookups: undefined})

const DOMAIN_LEDGER_ID = '1'

describe('domain/revoc-entry transaction transformations', () => {
  it('should add typeName and subledger for domain REVOC_REG_ENTRY transaction', async () => {
    const tx = _.cloneDeep(txRevocEntry)
    let transformed = await processor.transformTx(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txRevocEntry))
    expect(transformed.txn.typeName).toBe('REVOC_REG_ENTRY')
    expect(transformed.subledger.code).toBe(DOMAIN_LEDGER_ID)
    expect(transformed.subledger.name).toBe('DOMAIN')
    expect(transformed.txnMetadata.txnTime).toBe('2019-11-25T17:17:41.000Z')
  })
})
