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
const _ = require('lodash')

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

const POOL_LEDGER_ID = 0
const DOMAIN_LEDGER_ID = 1
const CONFIG_LEDGER_ID = 2
// const AUDIT_LEDGER_ID = 3

describe('elasticsearch pre-ingestion transaction transformations', () => {
  it('should add typeName and subledger for domain NYM transaction', async () => {
    const tx = _.cloneDeep(txNym)
    let transformed = await esTransform(tx, DOMAIN_LEDGER_ID)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txNym))
    expect(transformed.txn.typeName).toBe('NYM')
    expect(transformed.subledger.code).toBe(DOMAIN_LEDGER_ID)
    expect(transformed.subledger.name).toBe('DOMAIN')
  })

  it('should add typeName and subledger for domain SCHEMA transaction', async () => {
    const tx = _.cloneDeep(txSchemaDef)
    let transformed = await esTransform(tx, DOMAIN_LEDGER_ID)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txSchemaDef))
    expect(transformed.txn.typeName).toBe('SCHEMA')
    expect(transformed.subledger.code).toBe(DOMAIN_LEDGER_ID)
    expect(transformed.subledger.name).toBe('DOMAIN')
  })

  it('should add typeName and subledger for domain ATTRIB transaction', async () => {
    const tx = _.cloneDeep(txAttrib)
    let transformed = await esTransform(tx, DOMAIN_LEDGER_ID)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAttrib))
    expect(transformed.txn.typeName).toBe('ATTRIB')
    expect(transformed.subledger.code).toBe(DOMAIN_LEDGER_ID)
    expect(transformed.subledger.name).toBe('DOMAIN')
  })

  it('should add typeName and subledger for domain REVOC_REG_DEF transaction', async () => {
    const tx = _.cloneDeep(txRevocDef)
    let transformed = await esTransform(tx, DOMAIN_LEDGER_ID)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txRevocDef))
    expect(transformed.txn.typeName).toBe('REVOC_REG_DEF')
    expect(transformed.subledger.code).toBe(DOMAIN_LEDGER_ID)
    expect(transformed.subledger.name).toBe('DOMAIN')
  })

  it('should add typeName and subledger for domain REVOC_REG_ENTRY transaction', async () => {
    const tx = _.cloneDeep(txRevocEntry)
    let transformed = await esTransform(tx, DOMAIN_LEDGER_ID)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txRevocEntry))
    expect(transformed.txn.typeName).toBe('REVOC_REG_ENTRY')
    expect(transformed.subledger.code).toBe(DOMAIN_LEDGER_ID)
    expect(transformed.subledger.name).toBe('DOMAIN')
  })

  it('should transform domain CLAIM_DEF transaction', async () => {
    const tx = _.cloneDeep(txCredDef)
    let transformed = await esTransform(tx, DOMAIN_LEDGER_ID)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txCredDef))
    expect(transformed.txn.typeName).toBe('CLAIM_DEF')
    expect(transformed.txn.data.schema.txnSeqno).toBe(74631)
    expect(transformed.txn.data.schema.txnTime).toBe(1571048985)
    expect(transformed.txn.data.schema.schemaId).toBe('GJw3XR52kQEWY44vNojmyH:2:demo_credential_3:808.118.467')
    expect(transformed.txn.data.schema
      .schemaName).toBe('demo_credential_3')
    expect(transformed.txn.data.schema.schemaVersion).toBe('808.118.467')
    expect(transformed.txn.data.schema.schemaFrom).toBe('GJw3XR52kQEWY44vNojmyH')
    expect(transformed.txn.data.data).toBeUndefined()
    expect(transformed.subledger.code).toBe(DOMAIN_LEDGER_ID)
    expect(transformed.subledger.name).toBe('DOMAIN')
  })

  it('should add typeName and subledger for pool NODE transaction', async () => {
    const tx = _.cloneDeep(txNode)
    let transformed = await esTransform(tx, POOL_LEDGER_ID)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txNode))
    expect(transformed.txn.typeName).toBe('NODE')
    expect(transformed.subledger.code).toBe(POOL_LEDGER_ID)
    expect(transformed.subledger.name).toBe('POOL')
  })

  it('should add typeName and subledger for config TXN_AUTHOR_AGREEMENT transaction', async () => {
    const tx = _.cloneDeep(txAuthorAgreement)
    let transformed = await esTransform(tx, CONFIG_LEDGER_ID)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAuthorAgreement)) // check passed tx was not modified
    expect(transformed.txn.typeName).toBe('TXN_AUTHOR_AGREEMENT')
    expect(transformed.subledger.code).toBe(CONFIG_LEDGER_ID)
    expect(transformed.subledger.name).toBe('CONFIG')
  })

  it('should add typeName and subledger for config TXN_AUTHOR_AGREEMENT_AML transaction', async () => {
    const tx = _.cloneDeep(txAuthorAgreementAml)
    let transformed = await esTransform(tx, CONFIG_LEDGER_ID)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAuthorAgreementAml)) // check passed tx was not modified
    expect(transformed.txn.typeName).toBe('TXN_AUTHOR_AGREEMENT_AML')
    expect(transformed.subledger.code).toBe(CONFIG_LEDGER_ID)
    expect(transformed.subledger.name).toBe('CONFIG')
  })

  it('should add typeName and subledger for config AUTH_RULE transaction', async () => {
    const tx = _.cloneDeep(txAuthRule)
    let transformed = await esTransform(tx, CONFIG_LEDGER_ID)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAuthRule)) // check passed tx was not modified
    expect(transformed.txn.typeName).toBe('AUTH_RULE')
    expect(transformed.subledger.code).toBe(CONFIG_LEDGER_ID)
    expect(transformed.subledger.name).toBe('CONFIG')
  })

  it('should andd typeName and subledger for config NODE_UPGRADE transaction', async () => {
    const tx = _.cloneDeep(txNodeUpgrade)
    let transformed = await esTransform(tx, CONFIG_LEDGER_ID)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txNodeUpgrade)) // check passed tx was not modified
    expect(transformed.txn.typeName).toBe('NODE_UPGRADE')
    expect(transformed.subledger.code).toBe(CONFIG_LEDGER_ID)
    expect(transformed.subledger.name).toBe('CONFIG')
  })

  it('should not modify cconfig POOL_UPGRADE transaction', async () => {
    let transformed = await esTransform(txPoolUpgrade, CONFIG_LEDGER_ID)
    expect(transformed.txn.typeName).toBe('POOL_UPGRADE')
    expect(Array.isArray(transformed.txn.data.schedule)).toBeTruthy()
    expect(transformed.txn.data.schedule.length).toBe(13)
    let scheduleHash = '5mYsynpwzx3muLWYP5ZmqWK8oZtP5k7xj5w85NDKJSM6'
    let scheduleRecords = transformed.txn.data.schedule.filter(r => r.scheduleKey === scheduleHash)
    expect(scheduleRecords.length).toBe(1)
    expect(scheduleRecords[0].scheduleKey).toBe('5mYsynpwzx3muLWYP5ZmqWK8oZtP5k7xj5w85NDKJSM6')
    expect(scheduleRecords[0].scheduleTime).toBe('2019-11-11T10:05:00.555000-07:00')
    expect(transformed.subledger.code).toBe(CONFIG_LEDGER_ID)
    expect(transformed.subledger.name).toBe('CONFIG')
  })

  it('should add typeName and subledger for unknown domain transaction', async () => {
    const tx = _.cloneDeep(txUnknown)
    let transformed = await esTransform(tx, DOMAIN_LEDGER_ID)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txUnknown))
    expect(transformed.txn.typeName).toBe('UNKNOWN')
    expect(transformed.subledger.code).toBe(DOMAIN_LEDGER_ID)
    expect(transformed.subledger.name).toBe('DOMAIN')
  })

  it('should add typeName and subledger for unknown config transaction', async () => {
    const tx = _.cloneDeep(txUnknown)
    let transformed = await esTransform(tx, POOL_LEDGER_ID)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txUnknown))
    expect(transformed.txn.typeName).toBe('UNKNOWN')
    expect(transformed.subledger.code).toBe(POOL_LEDGER_ID)
    expect(transformed.subledger.name).toBe('POOL')
  })

  it('should add typeName and subledger for unknown config transaction', async () => {
    const tx = _.cloneDeep(txUnknown)
    let transformed = await esTransform(tx, CONFIG_LEDGER_ID)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txUnknown))
    expect(transformed.txn.typeName).toBe('UNKNOWN')
    expect(transformed.subledger.code).toBe(CONFIG_LEDGER_ID)
    expect(transformed.subledger.name).toBe('CONFIG')
  })
})
