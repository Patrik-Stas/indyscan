/* eslint-env jest */
const txSchemaDef = require('indyscan-storage/test/resource/sample-txs/tx-domain-schema')
const txCredDef = require('indyscan-storage/test/resource/sample-txs/tx-domain-creddef')
const _ = require('lodash')
const { createTargetMemory } = require('../../../../src/targets/target-memory')
const { createSourceMemory } = require('../../../../src/sources/source-memory')
const { createTransformerExpansion } = require('../../../../src/transformers/transformer-expansion')

let dataspace = {
  domain: {},
  pool: {},
  config: {}
}
let txSource = createSourceMemory({ id: 'inmem-mock', dataspace })
let txTarget = createTargetMemory({ id: 'inmem-mock', dataspace })
txTarget.addTxData('domain', 74631, 'original', txSchemaDef)
let processor = createTransformerExpansion({ id: 'foo', sourceLookups: txSource })

describe('domain/claim-def transaction transformations', () => {
  it('should transform domain CLAIM_DEF transaction', async () => {
    const tx = _.cloneDeep(txCredDef)
    const { processedTx } = await processor.processTx(tx)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txCredDef))
    expect(processedTx.txn.typeName).toBe('CLAIM_DEF')
    expect(processedTx.txn.data.refSchemaTxnSeqno).toBe(74631)
    expect(processedTx.txn.data.refSchemaTxnTime).toBe('2019-10-14T10:29:45.000Z')
    expect(processedTx.txn.data.refSchemaId).toBe('GJw3XR52kQEWY44vNojmyH:2:demo_credential_3:808.118.467')
    expect(processedTx.txn.data.refSchemaName).toBe('demo_credential_3')
    expect(processedTx.txn.data.refSchemaVersion).toBe('808.118.467')
    expect(processedTx.txn.data.refSchemaFrom).toBe('GJw3XR52kQEWY44vNojmyH')
    expect(Array.isArray(processedTx.txn.data.refSchemaAttributes)).toBeTruthy()
    expect(processedTx.txn.data.refSchemaAttributes.length).toBe(2)
    expect(processedTx.txn.data.refSchemaAttributes).toContain('bank_account_number')
    expect(processedTx.txn.data.refSchemaAttributes).toContain('bank_account_type')
    expect(processedTx.txn.data.data).toBeUndefined()
    expect(processedTx.txnMetadata.txnTime).toBe('2019-10-14T10:30:24.000Z')
  })
})
