/* eslint-env jest */
const txUnexpected = require('indyscan-storage/test/resource/sample-txs/tx-unexpected')
const _ = require('lodash')
const {createProcessorExpansion} = require('../../../src/processors/processor-expansion')

let processor = createProcessorExpansion({id:'foo', sourceLookups: undefined})

const DOMAIN_LEDGER_ID = '1'

describe('failing tx-specific transformations', () => {
  it('should capture transform error information in meta', async () => {
    const tx = _.cloneDeep(txUnexpected)
    let transformed = await processor.transformTx(tx)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txUnexpected))
    expect(transformed.meta).toBeDefined()
    expect(transformed.meta.transformError).toBeDefined()
    expect(transformed.meta.transformError.message).toBe('id.trim is not a function')
    expect(transformed.meta.transformError.stack).toContain('at roleIdToRoleAction')
  })

  it('should set shared transformation fields even if txType specific transformation fails', async () => {
    const tx = _.cloneDeep(txUnexpected)
    let transformed = await processor.transformTx(tx)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txUnexpected))
    expect(transformed.meta.transformError).toBeDefined()
    expect(transformed.txnMetadata.txnTime).toBe('2019-11-27T15:34:07.000Z')
    expect(transformed.txn.typeName).toBe('ATTRIB')
    expect(transformed.subledger.code).toBe(DOMAIN_LEDGER_ID)
    expect(transformed.subledger.name).toBe('DOMAIN')
  })

  it('should preserve original tx data if txType specific transformation fails', async () => {
    const tx = _.cloneDeep(txUnexpected)
    let transformed = await processor.transformTx(tx)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txUnexpected))
    expect(transformed.meta.transformError).toBeDefined()
    expect(transformed.txnMetadata.txnTime).toBe('2019-11-27T15:34:07.000Z')
    expect(transformed.txn.data.dest).toBe('DkiCRWTKf9JfWobvpBBMqJ')
    expect(transformed.txn.metadata.from).toBe('DkiCRWTKf9JfWobvpBBMqJ')
    expect(transformed.txn.metadata.digest).toBe('1081e066bad15fac68a20079019f3939df2cf3a30f6d0aded6b4c0a7109d3926')
    expect(transformed.rootHash).toBe('4c5Q3ZXF3NSqAWp4VoSEgVH3sUtfz4Sg6fotecZLotnK')
  })
})
