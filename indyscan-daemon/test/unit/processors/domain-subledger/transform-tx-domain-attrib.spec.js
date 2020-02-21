/* eslint-env jest */
const txAttribRoleSteward = require('indyscan-storage/test/resource/sample-txs/tx-domain-attrib-role-steward')
const txAttribRoleNetworkMonitor = require('indyscan-storage/test/resource/sample-txs/tx-domain-attrib-role-network-monitor')
const txAttribRoleEndorser = require('indyscan-storage/test/resource/sample-txs/tx-domain-attrib-role-endorser')
const txAttribRoleTrustee = require('indyscan-storage/test/resource/sample-txs/tx-domain-attrib-role-trustee')
const txAttribRoleRemove = require('indyscan-storage/test/resource/sample-txs/tx-domain-attrib-role-remove')
const txAttribRoleUnrecognized = require('indyscan-storage/test/resource/sample-txs/tx-domain-attrib-role-unrecognized')
const txAttribRoleRemoveWithSpace = require('indyscan-storage/test/resource/sample-txs/tx-domain-attrib-role-remove-with-spaces')
const txAttribRoleRemoveWithNull = require('indyscan-storage/test/resource/sample-txs/tx-domain-attrib-role-remove-with-null')
const txAttribVerkeyAbbreviated = require('indyscan-storage/test/resource/sample-txs/tx-domain-attrib-verkey-abbreviated')
const txAttribVerkeyFull = require('indyscan-storage/test/resource/sample-txs/tx-domain-attrib-verkey-full')
const txAttribRawAgent = require('indyscan-storage/test/resource/sample-txs/tx-domain-attrib-agent')
const txAttribRawUrl = require('indyscan-storage/test/resource/sample-txs/tx-domain-attrib-url')
const txAttribRawEndpoint = require('indyscan-storage/test/resource/sample-txs/tx-domain-attrib-endpoint')
const txAttribRawLastUpated = require('indyscan-storage/test/resource/sample-txs/tx-domain-attrib-last-updated')
const txAttribRawNoJson = require('indyscan-storage/test/resource/sample-txs/tx-domain-attrib-raw-invalid-json')
const txAttribRawNoDest = require('indyscan-storage/test/resource/sample-txs/tx-domain-attrib-verkey-no-dest')
const _ = require('lodash')
const { createProcessorExpansion } = require('../../../../src/processors/processor-expansion')

let processor = createProcessorExpansion({ id: 'foo', sourceLookups: undefined })

describe('domain/attrib transaction transformations', () => {
  it('should have correctly set basic fields', async () => {
    const tx = _.cloneDeep(txAttribRoleSteward)
    const { processedTx } = await processor.processTx(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAttribRoleSteward))
    expect(processedTx.txn.typeName).toBe('ATTRIB')
    expect(processedTx.txnMetadata.txnTime).toBe('2019-11-27T15:34:07.000Z')
  })

  it('should process ATTRIB transaction with SET_STEWARD role', async () => {
    const tx = _.cloneDeep(txAttribRoleSteward)
    const { processedTx } = await processor.processTx(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAttribRoleSteward))
    expect(processedTx.txn.data.endpoint).toBeUndefined()
    expect(processedTx.txn.data.roleAction).toBe('SET_STEWARD')
  })

  it('should process ATTRIB transaction with SET_NETWORK_MONITOR role', async () => {
    const tx = _.cloneDeep(txAttribRoleNetworkMonitor)
    const { processedTx } = await processor.processTx(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAttribRoleNetworkMonitor))
    expect(processedTx.txn.data.endpoint).toBeUndefined()
    expect(processedTx.txn.data.roleAction).toBe('SET_NETWORK_MONITOR')
  })

  it('should process ATTRIB transaction with SET_ENDORSER role', async () => {
    const tx = _.cloneDeep(txAttribRoleEndorser)
    const { processedTx } = await processor.processTx(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAttribRoleEndorser))
    expect(processedTx.txn.data.endpoint).toBeUndefined()
    expect(processedTx.txn.data.roleAction).toBe('SET_ENDORSER')
  })

  it('should process ATTRIB transaction and parse role action REMOVE_ROLE if role is set to empty string', async () => {
    const tx = _.cloneDeep(txAttribRoleRemove)
    const { processedTx } = await processor.processTx(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAttribRoleRemove))
    expect(processedTx.txn.data.endpoint).toBeUndefined()
    expect(processedTx.txn.data.roleAction).toBe('REMOVE_ROLE')
  })

  it('should process ATTRIB transaction and parse role action UNKNOWN_ROLE_ACTION if role value is not recognized', async () => {
    const tx = _.cloneDeep(txAttribRoleUnrecognized)
    const { processedTx } = await processor.processTx(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAttribRoleUnrecognized))
    expect(processedTx.txn.data.endpoint).toBeUndefined()
    expect(processedTx.txn.data.roleAction).toBe('UNKNOWN_ROLE_ACTION')
  })

  it('should process ATTRIB transaction and parse role action REMOVE_ROLE if role only contains whitespace', async () => {
    const tx = _.cloneDeep(txAttribRoleRemoveWithSpace)
    const { processedTx } = await processor.processTx(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAttribRoleRemoveWithSpace))
    expect(processedTx.txn.data.endpoint).toBeUndefined()
    expect(processedTx.txn.data.roleAction).toBe('REMOVE_ROLE')
  })

  it('should process ATTRIB transaction and parse role action REMOVE_ROLE if role only contains null', async () => {
    const tx = _.cloneDeep(txAttribRoleRemoveWithNull)
    const { processedTx } = await processor.processTx(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAttribRoleRemoveWithNull))
    expect(processedTx.txn.data.endpoint).toBeUndefined()
    expect(processedTx.txn.data.roleAction).toBe('REMOVE_ROLE')
  })

  it('should process ATTRIB transaction with SET_TRUSTEE role', async () => {
    const tx = _.cloneDeep(txAttribRoleTrustee)
    const { processedTx } = await processor.processTx(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAttribRoleTrustee))
    expect(processedTx.txn.data.endpoint).toBeUndefined()
    expect(processedTx.txn.data.roleAction).toBe('SET_TRUSTEE')
  })

  it('should process ATTRIB transaction with SET_TRUSTEE role', async () => {
    const tx = _.cloneDeep(txAttribRoleTrustee)
    const { processedTx } = await processor.processTx(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAttribRoleTrustee))
    expect(processedTx.txn.data.endpoint).toBeUndefined()
    expect(processedTx.txn.data.roleAction).toBe('SET_TRUSTEE')
  })

  it('should process ATTRIB transaction with full verkey', async () => {
    const tx = _.cloneDeep(txAttribVerkeyFull)
    const { processedTx } = await processor.processTx(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAttribVerkeyFull))
    expect(processedTx.txn.data.endpoint).toBeUndefined()
    expect(processedTx.txn.data.verkey).toBe('CCmfrY44mSJYfq9tuqAqA2bWEdCfQNfztQ48r9u8v6hz')
    expect(processedTx.txn.data.verkeyFull).toBe('CCmfrY44mSJYfq9tuqAqA2bWEdCfQNfztQ48r9u8v6hz')
  })

  it('should process ATTRIB transaction with abbreviated verkey', async () => {
    const tx = _.cloneDeep(txAttribVerkeyAbbreviated)
    const { processedTx } = await processor.processTx(tx, 'DOMAIN')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAttribVerkeyAbbreviated))
    expect(processedTx.txn.data.endpoint).toBeUndefined()
    expect(processedTx.txn.data.verkey).toBe('~GeaB26UyUbU9KWcyvv1Mbf')
    expect(processedTx.txn.data.verkeyFull).toBe('DkiCRWTKf9JfWobvpBBMqJGeaB26UyUbU9KWcyvv1Mbf')
  })

  it('should add typeName and subledger for domain ATTRIB transaction with agent in raw dadtat', async () => {
    const tx = _.cloneDeep(txAttribRawAgent)
    const { processedTx } = await processor.processTx(tx, 'DOMAIN')
    expect(processedTx.txn.typeName).toBe('ATTRIB')
    expect(processedTx.txn.data.endpoint).toBe('http://localhost:8080/agency')
  })

  it('should add typeName and subledger for domain ATTRIB transaction with url in raw data', async () => {
    const tx = _.cloneDeep(txAttribRawUrl)
    const { processedTx } = await processor.processTx(tx, 'DOMAIN')
    expect(processedTx.txn.typeName).toBe('ATTRIB')
    expect(processedTx.txn.data.endpoint).toBe('https://bayer.agent.develop.ssigate.ch/api/v2/inbox')
  })

  it('should add typeName and subledger for domain ATTRIB transaction with endpoint in raw data', async () => {
    const tx = _.cloneDeep(txAttribRawEndpoint)
    const { processedTx } = await processor.processTx(tx, 'DOMAIN')
    expect(processedTx.txn.typeName).toBe('ATTRIB')
    expect(processedTx.txn.data.endpoint).toBe('https://bayer.agent.develop.ssigate.ch/api/v1/inbox')
  })

  it('should add typeName and subledger for domain ATTRIB transaction with last_updated in raw data', async () => {
    const tx = _.cloneDeep(txAttribRawLastUpated)
    const { processedTx } = await processor.processTx(tx, 'DOMAIN')
    expect(processedTx.txn.typeName).toBe('ATTRIB')
    expect(processedTx.txn.data.lastUpdated).toBe(1572956741.1868246)
  })

  it('should add typeName and subledger for domain ATTRIB transaction without json in raw data', async () => {
    const tx = _.cloneDeep(txAttribRawNoJson)
    const { processedTx } = await processor.processTx(tx, 'DOMAIN')
    expect(processedTx.txn.typeName).toBe('ATTRIB')
    expect(processedTx.txn.data.raw).toBe('foobar')
  })

  it('should use set "dest" if missing using did of tx sender', async () => {
    const tx = _.cloneDeep(txAttribRawNoDest)
    const { processedTx } = await processor.processTx(tx, 'DOMAIN')
    expect(processedTx.txn.typeName).toBe('ATTRIB')
    expect(processedTx.txn.data.dest).toBe(processedTx.txn.metadata.from)
  })
  // https://github.com/hyperledger/indy-node/blob/master/docs/source/auth_rules.md
})
