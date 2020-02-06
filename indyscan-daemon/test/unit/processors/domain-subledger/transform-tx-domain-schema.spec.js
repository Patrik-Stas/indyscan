/* eslint-env jest */
const txSchemaDef = require('indyscan-storage/test/resource/sample-txs/tx-domain-schema')
const _ = require('lodash')
const {createProcessorExpansion} = require('../../../../src/processors/processor-expansion')

let processor = createProcessorExpansion({id:'foo', sourceLookups: undefined})

const DOMAIN_LEDGER_ID = '1'

describe('domain/schema transaction transformations', () => {
  it('should add typeName and subledger for domain SCHEMA transaction', async () => {
    const tx = _.cloneDeep(txSchemaDef)
    const {processedTx}  = await processor.processTx(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txSchemaDef))
    expect(processedTx.txn.typeName).toBe('SCHEMA')
    expect(processedTx.subledger.code).toBe(DOMAIN_LEDGER_ID)
    expect(processedTx.subledger.name).toBe('DOMAIN')
    expect(processedTx.txnMetadata.txnTime).toBe('2019-10-14T10:29:45.000Z')
  })
})
