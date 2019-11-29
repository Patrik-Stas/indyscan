/* eslint-env jest */
const { createEsTxTransform } = require('../../../src/es/es-transformations')
const txNym = require('../../resource/sample-txs/tx-domain-nym')
const txAttrib = require('../../resource/sample-txs/tx-domain-attrib')
const txSchemaDef = require('../../resource/sample-txs/tx-domain-schema')
const txCredDef = require('../../resource/sample-txs/tx-domain-creddef')
const txRevocDef = require('../../resource/sample-txs/tx-domain-revoc-reg-def')
const txRevocEntry = require('../../resource/sample-txs/tx-domain-revoc-reg-entry')
const txNode = require('../../resource/sample-txs/tx-pool-node')
const txAuthorAgreement = require('../../resource/sample-txs/tx-config-txn-author-agreement')
const txAuthorAgreementAml = require('../../resource/sample-txs/tx-config-txn-author-agreement-aml')
const txAuthRule = require('../../resource/sample-txs/tx-config-auth-rule')
const txNodeUpgrade = require('../../resource/sample-txs/tx-config-node-upgrade')
const txPoolUpgrade = require('../../resource/sample-txs/tx-config-pool-upgrade')
const txUnknown = require('../../resource/sample-txs/tx-madeup-unknown')

let esTransform
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
  it('should not modify domain NYM transaction', async () => {
    let transformed = await esTransform(txNym)
    expect(JSON.stringify(transformed)).toBe(JSON.stringify(txNym))
  })

  it('should not modify domain SCHEMA transaction', async () => {
    let transformed = await esTransform(txSchemaDef)
    expect(JSON.stringify(transformed)).toBe(JSON.stringify(txSchemaDef))
  })

  it('should not modify domain ATTRIB transaction', async () => {
    let transformed = await esTransform(txAttrib)
    expect(JSON.stringify(transformed)).toBe(JSON.stringify(txAttrib))
  })

  it('should not modify domain REVOC_REG_DEF transaction', async () => {
    let transformed = await esTransform(txRevocDef)
    expect(JSON.stringify(transformed)).toBe(JSON.stringify(txRevocDef))
  })

  it('should not modify domain REVOC_REG_ENTRY transaction', async () => {
    let transformed = await esTransform(txRevocEntry)
    expect(JSON.stringify(transformed)).toBe(JSON.stringify(txRevocEntry))
  })

  it('should transform domain CLAIM_DEF transaction', async () => {
    let transformed = await esTransform(txCredDef)
    expect(transformed.txn.data.schema.txnSeqno).toBe(74631)
    expect(transformed.txn.data.schema.txnTime).toBe(1571048985)
    expect(transformed.txn.data.schema.schemaId).toBe('GJw3XR52kQEWY44vNojmyH:2:demo_credential_3:808.118.467')
    expect(transformed.txn.data.schema.
      schemaName).toBe('demo_credential_3')
    expect(transformed.txn.data.schema.schemaVersion).toBe('808.118.467')
    expect(transformed.txn.data.schema.schemaFrom).toBe('GJw3XR52kQEWY44vNojmyH')
    expect(transformed.txn.data.data).toBeUndefined()
  })

  it('should not modify pool NODE transaction', async () => {
    let transformed = await esTransform(txNode)
    expect(JSON.stringify(transformed)).toBe(JSON.stringify(txNode))
  })

  it('should not modify config TXN_AUTHOR_AGREEMENT transaction', async () => {
    let transformed = await esTransform(txAuthorAgreement)
    expect(JSON.stringify(transformed)).toBe(JSON.stringify(txAuthorAgreement))
  })

  it('should not modify cconfig TXN_AUTHOR_AGREEMENT_AML transaction', async () => {
    let transformed = await esTransform(txAuthorAgreementAml)
    expect(JSON.stringify(transformed)).toBe(JSON.stringify(txAuthorAgreementAml))
  })

  it('should not modify cconfig TXN_AUTH_RULE transaction', async () => {
    let transformed = await esTransform(txAuthRule)
    expect(JSON.stringify(transformed)).toBe(JSON.stringify(txAuthRule))
  })

  it('should not modify cconfig TXN_NODE_UPGRADE transaction', async () => {
    let transformed = await esTransform(txNodeUpgrade)
    expect(JSON.stringify(transformed)).toBe(JSON.stringify(txNodeUpgrade))
  })

  it('should not modify cconfig TXN_POOL_UPGRADE transaction', async () => {
    let transformed = await esTransform(txPoolUpgrade)
    expect(JSON.stringify(transformed)).toBe(JSON.stringify(txPoolUpgrade))
  })

  it('should not modify an unknown transaction', async () => {
    let transformed = await esTransform(txUnknown)
    expect(JSON.stringify(transformed)).toBe(JSON.stringify(txUnknown))
  })
})
