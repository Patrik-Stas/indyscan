/* eslint-env jest */
const { createEsTxTransform } = require('../../../src/es/es-transformations')
const txNym = require('../../resource/sample-txs/tx-domain-nym-noraw')
const txNymAgent = require('../../resource/sample-txs/tx-domain-nym-agent')
const txNymEndpoint = require('../../resource/sample-txs/tx-domain-nym-endpoint')
const txNymUrl = require('../../resource/sample-txs/tx-domain-nym-url')
const txNymInvaliJson = require('../../resource/sample-txs/tx-domain-nym-invalid-json')
const txNymLastUpdated = require('../../resource/sample-txs/tx-domain-nym-last-updated')
const txAttribNoRaw = require('../../resource/sample-txs/tx-domain-attrib-noraw')
const txAttribRawAgent = require('../../resource/sample-txs/tx-domain-attrib-agent')
const txAttribRawUrl = require('../../resource/sample-txs/tx-domain-attrib-url')
const txAttribRawEndpoint = require('../../resource/sample-txs/tx-domain-attrib-endpoint')
const txAttribRawLastUpated = require('../../resource/sample-txs/tx-domain-attrib-last-updated')
const txAttribRawNoJson = require('../../resource/sample-txs/tx-domain-attrib-raw-invalid-json')
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

const POOL_LEDGER_ID = '0'
const DOMAIN_LEDGER_ID = '1'
const CONFIG_LEDGER_ID = '2'
// const AUDIT_LEDGER_ID = 3

describe('elasticsearch pre-ingestion transaction transformations', () => {
  it('should add typeName and subledger for domain NYM transaction', async () => {
    const tx = _.cloneDeep(txNym)
    let transformed = await esTransform(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txNym))
    expect(transformed.txn.typeName).toBe('NYM')
    expect(transformed.subledger.code).toBe(DOMAIN_LEDGER_ID)
    expect(transformed.subledger.name).toBe('DOMAIN')
    expect(transformed.txnMetadata.txnTime).toBe('2019-11-26T19:32:01.000Z')
  })

  it('should add typeName and subledger for domain NYM transaction with agent in raw data', async () => {
    const tx = _.cloneDeep(txNymAgent)
    let transformed = await esTransform(tx, 'DOMAIN')
    expect(transformed.txn.typeName).toBe('NYM')
    expect(transformed.txn.data.endpoint).toBe('http://localhost:8080/agency')
  })

  it('should add typeName and subledger for domain NYM transaction with agent in raw data', async () => {
    const tx = _.cloneDeep(txNymEndpoint)
    let transformed = await esTransform(tx, 'DOMAIN')
    expect(transformed.txn.typeName).toBe('NYM')
    expect(transformed.txn.data.endpoint).toBe('https://bayer.agent.develop.ssigate.ch/api/v1/inbox')
  })

  it('should add typeName and subledger for domain NYM transaction with agent in raw data', async () => {
    const tx = _.cloneDeep(txNymUrl)
    let transformed = await esTransform(tx, 'DOMAIN')
    expect(transformed.txn.typeName).toBe('NYM')
    expect(transformed.txn.data.endpoint).toBe('https://bayer.agent.develop.ssigate.ch/api/v2/inbox')
  })

  it('should add typeName and subledger for domain NYM transaction with agent in raw data', async () => {
    const tx = _.cloneDeep(txNymInvaliJson)
    let transformed = await esTransform(tx, 'DOMAIN')
    expect(transformed.txn.typeName).toBe('NYM')
    expect(transformed.txn.data.endpoint).toBeUndefined()
    expect(transformed.txn.data.raw).toBe('foobar')
  })

  it('should add typeName and subledger for domain NYM transaction with last_upated in raw data', async () => {
    const tx = _.cloneDeep(txNymLastUpdated)
    let transformed = await esTransform(tx, 'DOMAIN')
    expect(transformed.txn.typeName).toBe('NYM')
    expect(transformed.txn.data.lastUpdated).toBe(1572956741.1868246)
  })

  it('should add typeName and subledger for domain SCHEMA transaction', async () => {
    const tx = _.cloneDeep(txSchemaDef)
    let transformed = await esTransform(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txSchemaDef))
    expect(transformed.txn.typeName).toBe('SCHEMA')
    expect(transformed.subledger.code).toBe(DOMAIN_LEDGER_ID)
    expect(transformed.subledger.name).toBe('DOMAIN')
    expect(transformed.txnMetadata.txnTime).toBe('2019-10-14T10:29:45.000Z')
  })

  it('should add typeName and subledger for domain ATTRIB transaction without raw data', async () => {
    const tx = _.cloneDeep(txAttribNoRaw)
    let transformed = await esTransform(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAttribNoRaw))
    expect(transformed.txn.typeName).toBe('ATTRIB')
    expect(transformed.subledger.code).toBe(DOMAIN_LEDGER_ID)
    expect(transformed.subledger.name).toBe('DOMAIN')
    expect(transformed.txnMetadata.txnTime).toBe('2019-11-27T15:34:07.000Z')
  })

  it('should add typeName and subledger for domain ATTRIB transaction with agent in raw dadtat', async () => {
    const tx = _.cloneDeep(txAttribRawAgent)
    let transformed = await esTransform(tx, 'DOMAIN')
    expect(transformed.txn.typeName).toBe('ATTRIB')
    expect(transformed.txn.data.endpoint).toBe('http://localhost:8080/agency')
  })

  it('should add typeName and subledger for domain ATTRIB transaction with url in raw data', async () => {
    const tx = _.cloneDeep(txAttribRawUrl)
    let transformed = await esTransform(tx, 'DOMAIN')
    expect(transformed.txn.typeName).toBe('ATTRIB')
    expect(transformed.txn.data.endpoint).toBe('https://bayer.agent.develop.ssigate.ch/api/v2/inbox')
  })

  it('should add typeName and subledger for domain ATTRIB transaction with endpoint in raw data', async () => {
    const tx = _.cloneDeep(txAttribRawEndpoint)
    let transformed = await esTransform(tx, 'DOMAIN')
    expect(transformed.txn.typeName).toBe('ATTRIB')
    expect(transformed.txn.data.endpoint).toBe('https://bayer.agent.develop.ssigate.ch/api/v1/inbox')
  })

  it('should add typeName and subledger for domain ATTRIB transaction with last_updated in raw data', async () => {
    const tx = _.cloneDeep(txAttribRawLastUpated)
    let transformed = await esTransform(tx, 'DOMAIN')
    expect(transformed.txn.typeName).toBe('ATTRIB')
    expect(transformed.txn.data.lastUpdated).toBe(1572956741.1868246)
  })

  it('should add typeName and subledger for domain ATTRIB transaction without json in raw data', async () => {
    const tx = _.cloneDeep(txAttribRawNoJson)
    let transformed = await esTransform(tx, 'DOMAIN')
    expect(transformed.txn.typeName).toBe('ATTRIB')
    expect(transformed.txn.data.raw).toBe('foobar')
  })

  it('should add typeName and subledger for domain REVOC_REG_DEF transaction', async () => {
    const tx = _.cloneDeep(txRevocDef)
    let transformed = await esTransform(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txRevocDef))
    expect(transformed.txn.typeName).toBe('REVOC_REG_DEF')
    expect(transformed.subledger.code).toBe(DOMAIN_LEDGER_ID)
    expect(transformed.subledger.name).toBe('DOMAIN')
    expect(transformed.txnMetadata.txnTime).toBe('2019-11-26T11:23:55.000Z')
  })

  it('should add typeName and subledger for domain REVOC_REG_ENTRY transaction', async () => {
    const tx = _.cloneDeep(txRevocEntry)
    let transformed = await esTransform(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txRevocEntry))
    expect(transformed.txn.typeName).toBe('REVOC_REG_ENTRY')
    expect(transformed.subledger.code).toBe(DOMAIN_LEDGER_ID)
    expect(transformed.subledger.name).toBe('DOMAIN')
    expect(transformed.txnMetadata.txnTime).toBe('2019-11-25T17:17:41.000Z')
  })

  it('should transform domain CLAIM_DEF transaction', async () => {
    const tx = _.cloneDeep(txCredDef)
    let transformed = await esTransform(tx, 'DOMAIN')
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

  it('should add typeName and subledger for pool NODE transaction', async () => {
    const tx = _.cloneDeep(txNode)
    let transformed = await esTransform(tx, 'POOL')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txNode))
    expect(transformed.txn.typeName).toBe('NODE')
    expect(transformed.subledger.code).toBe(POOL_LEDGER_ID)
    expect(transformed.subledger.name).toBe('POOL')
    expect(transformed.txnMetadata.txnTime).toBe('2019-11-08T21:40:59.000Z')
    expect(transformed.txn.data.data.client_ip_geo.country).toBe('US')
    expect(transformed.txn.data.data.client_ip_geo.region).toBe('VA')
    expect(transformed.txn.data.data.client_ip_geo.eu).toBe(false)
    expect(transformed.txn.data.data.client_ip_geo.timezone).toBe('America/New_York')
    expect(transformed.txn.data.data.client_ip_geo.city).toBe('Ashburn')
    expect(transformed.txn.data.data.client_ip_geo.location.lat.toString()).toContain(39.018.toString())
    expect(transformed.txn.data.data.client_ip_geo.location.lon.toString()).toContain(-77.539.toString())

    expect(transformed.txn.data.data.node_ip_geo.country).toBe('US')
    expect(transformed.txn.data.data.node_ip_geo.region).toBe('VA')
    expect(transformed.txn.data.data.node_ip_geo.eu).toBe(false)
    expect(transformed.txn.data.data.node_ip_geo.timezone).toBe('America/New_York')
    expect(transformed.txn.data.data.node_ip_geo.city).toBe('Ashburn')
    expect(transformed.txn.data.data.node_ip_geo.location.lat.toString()).toContain(39.018.toString())
    expect(transformed.txn.data.data.node_ip_geo.location.lon.toString()).toContain(-77.539.toString())
  })

  it('should add typeName and subledger for config TXN_AUTHOR_AGREEMENT transaction', async () => {
    const tx = _.cloneDeep(txAuthorAgreement)
    let transformed = await esTransform(tx, 'CONFIG')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAuthorAgreement)) // check passed tx was not modified
    expect(transformed.txn.typeName).toBe('TXN_AUTHOR_AGREEMENT')
    expect(transformed.subledger.code).toBe(CONFIG_LEDGER_ID)
    expect(transformed.subledger.name).toBe('CONFIG')
    expect(transformed.txnMetadata.txnTime).toBe('2019-09-16T20:15:53.000Z')
  })

  it('should add typeName and subledger for config TXN_AUTHOR_AGREEMENT_AML transaction', async () => {
    const tx = _.cloneDeep(txAuthorAgreementAml)
    let transformed = await esTransform(tx, 'CONFIG')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAuthorAgreementAml)) // check passed tx was not modified
    expect(transformed.txn.typeName).toBe('TXN_AUTHOR_AGREEMENT_AML')
    expect(transformed.subledger.code).toBe(CONFIG_LEDGER_ID)
    expect(transformed.subledger.name).toBe('CONFIG')
    expect(transformed.txnMetadata.txnTime).toBe('2019-09-16T17:35:45.000Z')
  })

  it('should add typeName and subledger for config AUTH_RULE transaction', async () => {
    const tx = _.cloneDeep(txAuthRule)
    let transformed = await esTransform(tx, 'CONFIG')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAuthRule)) // check passed tx was not modified
    expect(transformed.txn.typeName).toBe('AUTH_RULE')
    expect(transformed.subledger.code).toBe(CONFIG_LEDGER_ID)
    expect(transformed.subledger.name).toBe('CONFIG')
    expect(transformed.txnMetadata.txnTime).toBe('2019-11-18T22:20:12.000Z')
  })

  it('should andd typeName and subledger for config NODE_UPGRADE transaction', async () => {
    const tx = _.cloneDeep(txNodeUpgrade)
    let transformed = await esTransform(tx, 'CONFIG')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txNodeUpgrade)) // check passed tx was not modified
    expect(transformed.txn.typeName).toBe('NODE_UPGRADE')
    expect(transformed.subledger.code).toBe(CONFIG_LEDGER_ID)
    expect(transformed.subledger.name).toBe('CONFIG')
    expect(transformed.txnMetadata.txnTime).toBe('2019-11-11T17:06:31.000Z')
  })

  it('should not modify config POOL_UPGRADE transaction', async () => {
    let transformed = await esTransform(txPoolUpgrade, 'CONFIG')
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
    expect(transformed.txnMetadata.txnTime).toBe('2019-11-11T14:23:24.000Z')
  })

  it('should add typeName and subledger for unknown domain transaction', async () => {
    const tx = _.cloneDeep(txUnknown)
    let transformed = await esTransform(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txUnknown))
    expect(transformed.txn.typeName).toBe('UNKNOWN')
    expect(transformed.subledger.code).toBe(DOMAIN_LEDGER_ID)
    expect(transformed.subledger.name).toBe('DOMAIN')
    expect(transformed.txnMetadata.txnTime).toBe('2019-11-08T21:40:59.000Z')
  })

  it('should add typeName and subledger for unknown config transaction', async () => {
    const tx = _.cloneDeep(txUnknown)
    let transformed = await esTransform(tx, 'POOL')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txUnknown))
    expect(transformed.txn.typeName).toBe('UNKNOWN')
    expect(transformed.subledger.code).toBe(POOL_LEDGER_ID)
    expect(transformed.subledger.name).toBe('POOL')
    expect(transformed.txnMetadata.txnTime).toBe('2019-11-08T21:40:59.000Z')
  })

  it('should add typeName and subledger for unknown config transaction', async () => {
    const tx = _.cloneDeep(txUnknown)
    let transformed = await esTransform(tx, 'CONFIG')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txUnknown))
    expect(transformed.txn.typeName).toBe('UNKNOWN')
    expect(transformed.subledger.code).toBe(CONFIG_LEDGER_ID)
    expect(transformed.subledger.name).toBe('CONFIG')
    expect(transformed.txnMetadata.txnTime).toBe('2019-11-08T21:40:59.000Z')
  })
})
