/* eslint-env jest */
const txSchemaDef = require('indyscan-storage/test/resource/sample-txs/tx-domain-schema')
const txCredDef = require('indyscan-storage/test/resource/sample-txs/tx-domain-creddef')
const _ = require('lodash')
const {createSourceMemory} = require('../../source-memory')
const {createProcessorExpansion} = require('../../../../src/processors/processor-expansion')

let txSource = createSourceMemory({id:'inmem-mock'})
txSource.addTx('domain', 74631, 'original', txSchemaDef)
let processor = createProcessorExpansion({id:'foo', sourceLookups: txSource})

const DOMAIN_LEDGER_ID = '1'

describe('domain/claim-def transaction transformations', () => {
  it('should transform domain CLAIM_DEF transaction', async () => {
    const tx = _.cloneDeep(txCredDef)
    let transformed = await processor.transformTx(tx)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txCredDef))
    expect(transformed.txn.typeName).toBe('CLAIM_DEF')
    expect(transformed.txn.data.refSchemaTxnSeqno).toBe(74631)
    expect(transformed.txn.data.refSchemaTxnTime).toBe('2019-10-14T10:29:45.000Z')
    expect(transformed.txn.data.refSchemaId).toBe('GJw3XR52kQEWY44vNojmyH:2:demo_credential_3:808.118.467')
    expect(transformed.txn.data.refSchemaName).toBe('demo_credential_3')
    expect(transformed.txn.data.refSchemaVersion).toBe('808.118.467')
    expect(transformed.txn.data.refSchemaFrom).toBe('GJw3XR52kQEWY44vNojmyH')
    expect(Array.isArray(transformed.txn.data.refSchemaAttributes)).toBeTruthy()
    expect(transformed.txn.data.refSchemaAttributes.length).toBe(2)
    expect(transformed.txn.data.refSchemaAttributes).toContain('bank_account_number')
    expect(transformed.txn.data.refSchemaAttributes).toContain('bank_account_type')
    expect(transformed.txn.data.data).toBeUndefined()
    expect(transformed.subledger.code).toBe(DOMAIN_LEDGER_ID)
    expect(transformed.subledger.name).toBe('DOMAIN')
    expect(transformed.txnMetadata.txnTime).toBe('2019-10-14T10:30:24.000Z')
  })
})
