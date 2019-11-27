/* eslint-env jest */
const { createEsTxTransform } = require('../../../src/es/es-transformations')
const { txNym, txCredDef, txSchemaDef } = require('../../resource/sample-tx')

let esTransform = undefined
beforeAll(() => {
  esTransform = createEsTxTransform((seqno) => {
    if (seqno === 74631) {
      return txSchemaDef
    } else {
      throw Error(`Mock for tx ${seqno} was not prepared.`)
    }
  })
})

describe('esTransform', () => {
  it('should have basic field after transform', async () => {
    let transformed = await esTransform(txNym)
    expect(transformed.original).toBeDefined()
    expect(transformed.transformed).toBeDefined()
  })

  it('should transform cred def', async () => {
    let transformed = await esTransform(txCredDef)
    expect(transformed.original).toBeDefined()
    expect(transformed.transformed.txn.data.schema.txnSeqno).toBe()
    expect(transformed.transformed.txn.data.schema.txnTime).toBe()
    expect(transformed.transformed.txn.data.schema.schemaId).toBe()
    expect(transformed.transformed.txn.data.schema.schemaName).toBe()
    expect(transformed.transformed.txn.data.schema.schemaVersion).toBe()
    expect(transformed.transformed.txn.data.schema.schemaFrom).toBe()
  })
})
