/* eslint-env jest */
const { createEsTxTransform } = require('../../src/transformation/transform-tx')
const txAttribRoleSteward = require('../resource/sample-txs/tx-domain-attrib-role-steward')
const txAttribRoleTrustee = require('../resource/sample-txs/tx-domain-attrib-role-trustee')
const txAttribVerkeyAbbreviated = require('../resource/sample-txs/tx-domain-attrib-verkey-abbreviated')
const txAttribVerkeyFull = require('../resource/sample-txs/tx-domain-attrib-verkey-full')
const txAttribRawAgent = require('../resource/sample-txs/tx-domain-attrib-agent')
const txAttribRawUrl = require('../resource/sample-txs/tx-domain-attrib-url')
const txAttribRawEndpoint = require('../resource/sample-txs/tx-domain-attrib-endpoint')
const txAttribRawLastUpated = require('../resource/sample-txs/tx-domain-attrib-last-updated')
const txAttribRawNoJson = require('../resource/sample-txs/tx-domain-attrib-raw-invalid-json')
const txAttribRawNoDest = require('../resource/sample-txs/tx-domain-attrib-verkey-no-dest')
const _ = require('lodash')

let esTransform = createEsTxTransform((seqno) => {throw Error(`Domain tx lookup seqno=${seqno } was not expected.`)})

const DOMAIN_LEDGER_ID = '1'

describe('domain/attrib transaction transformations', () => {
  it('should process ATTRIB transaction with SET_STEWARD role', async () => {
    const tx = _.cloneDeep(txAttribRoleSteward)
    let transformed = await esTransform(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAttribRoleSteward))
    expect(transformed.txn.typeName).toBe('ATTRIB')
    expect(transformed.subledger.code).toBe(DOMAIN_LEDGER_ID)
    expect(transformed.subledger.name).toBe('DOMAIN')
    expect(transformed.txnMetadata.txnTime).toBe('2019-11-27T15:34:07.000Z')
    expect(transformed.txn.data.endpoint).toBeUndefined()
    expect(transformed.txn.data.roleName).toBe("SET_STEWARD")
  })

  it('should process ATTRIB transaction with SET_TRUSTEE role', async () => {
    const tx = _.cloneDeep(txAttribRoleTrustee)
    let transformed = await esTransform(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAttribRoleTrustee))
    expect(transformed.txn.typeName).toBe('ATTRIB')
    expect(transformed.subledger.code).toBe(DOMAIN_LEDGER_ID)
    expect(transformed.subledger.name).toBe('DOMAIN')
    expect(transformed.txnMetadata.txnTime).toBe('2019-11-27T15:34:07.000Z')
    expect(transformed.txn.data.endpoint).toBeUndefined()
    expect(transformed.txn.data.roleName).toBe("SET_TRUSTEE")
  })

  it('should process ATTRIB transaction with full verkey', async () => {
    const tx = _.cloneDeep(txAttribVerkeyFull)
    let transformed = await esTransform(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAttribVerkeyFull))
    expect(transformed.txn.typeName).toBe('ATTRIB')
    expect(transformed.subledger.code).toBe(DOMAIN_LEDGER_ID)
    expect(transformed.subledger.name).toBe('DOMAIN')
    expect(transformed.txnMetadata.txnTime).toBe('2019-11-27T15:34:07.000Z')
    expect(transformed.txn.data.endpoint).toBeUndefined()
    expect(transformed.txn.data.verkey).toBe("CCmfrY44mSJYfq9tuqAqA2bWEdCfQNfztQ48r9u8v6hz")
    expect(transformed.txn.data.verkeyFull).toBe("CCmfrY44mSJYfq9tuqAqA2bWEdCfQNfztQ48r9u8v6hz")
  })

  it('should process ATTRIB transaction with abbreviated verkey', async () => {
    const tx = _.cloneDeep(txAttribVerkeyAbbreviated)
    let transformed = await esTransform(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAttribVerkeyAbbreviated))
    expect(transformed.txn.typeName).toBe('ATTRIB')
    expect(transformed.subledger.code).toBe(DOMAIN_LEDGER_ID)
    expect(transformed.subledger.name).toBe('DOMAIN')
    expect(transformed.txnMetadata.txnTime).toBe('2019-11-27T15:34:07.000Z')
    expect(transformed.txn.data.endpoint).toBeUndefined()
    expect(transformed.txn.data.verkey).toBe("~GeaB26UyUbU9KWcyvv1Mbf")
    expect(transformed.txn.data.verkeyFull).toBe("DkiCRWTKf9JfWobvpBBMqJGeaB26UyUbU9KWcyvv1Mbf")
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

  it('should use set "dest" if missing using did of tx sender', async () => {
    const tx = _.cloneDeep(txAttribRawNoDest)
    let transformed = await esTransform(tx, 'DOMAIN')
    expect(transformed.txn.typeName).toBe('ATTRIB')
    expect(transformed.txn.data.dest).toBe(transformed.txn.metadata.from)
  })
  // https://github.com/hyperledger/indy-node/blob/master/docs/source/auth_rules.md
})
