/* eslint-env jest */
const txtype = require('../index')

describe('basic suite', () => {
  it('should convert tx name to code', async () => {
    expect(txtype.txNameToTxCode('NYM')).toBe('1')
    expect(txtype.txNameToTxCode('ATTRIB')).toBe('100')
    expect(txtype.txNameToTxCode('SCHEMA')).toBe('101')
    expect(txtype.txNameToTxCode('CLAIM_DEF')).toBe('102')
    expect(txtype.txNameToTxCode('REVOC_REG_DEF')).toBe('113')
    expect(txtype.txNameToTxCode('REVOC_REG_ENTRY')).toBe('114')
    expect(txtype.txNameToTxCode('SET_CONTEXT')).toBe('200')
    expect(txtype.txNameToTxCode('NODE')).toBe('0')
    expect(txtype.txNameToTxCode('POOL_UPGRADE')).toBe('109')
    expect(txtype.txNameToTxCode('NODE_UPGRADE')).toBe('110')
    expect(txtype.txNameToTxCode('POOL_CONFIG')).toBe('111')
    expect(txtype.txNameToTxCode('AUTH_RULE')).toBe('120')
    expect(txtype.txNameToTxCode('AUTH_RULES')).toBe('122')
    expect(txtype.txNameToTxCode('TXN_AUTHOR_AGREEMENT')).toBe('4')
    expect(txtype.txNameToTxCode('TXN_AUTHOR_AGREEMENT_AML')).toBe('5')
  })

  it('should convert tx code to name', async () => {
    expect(txtype.txTypeToTxName('1')).toBe('NYM')
    expect(txtype.txTypeToTxName('100')).toBe('ATTRIB')
    expect(txtype.txTypeToTxName('101')).toBe('SCHEMA')
    expect(txtype.txTypeToTxName('102')).toBe('CLAIM_DEF')
    expect(txtype.txTypeToTxName('113')).toBe('REVOC_REG_DEF')
    expect(txtype.txTypeToTxName('114')).toBe('REVOC_REG_ENTRY')
    expect(txtype.txTypeToTxName('200')).toBe('SET_CONTEXT')
    expect(txtype.txTypeToTxName('0')).toBe('NODE')
    expect(txtype.txTypeToTxName('109')).toBe('POOL_UPGRADE')
    expect(txtype.txTypeToTxName('110')).toBe('NODE_UPGRADE')
    expect(txtype.txTypeToTxName('111')).toBe('POOL_CONFIG')
    expect(txtype.txTypeToTxName('120')).toBe('AUTH_RULE')
    expect(txtype.txTypeToTxName('122')).toBe('AUTH_RULES')
    expect(txtype.txTypeToTxName('4')).toBe('TXN_AUTHOR_AGREEMENT')
    expect(txtype.txTypeToTxName('5')).toBe('TXN_AUTHOR_AGREEMENT_AML')
  })

  it('should get all domain transaction names', async () => {
    expect(txtype.getDomainsTxNames().includes('NYM')).toBeTruthy()
    expect(txtype.getDomainsTxNames().includes('ATTRIB')).toBeTruthy()
    expect(txtype.getDomainsTxNames().includes('SCHEMA')).toBeTruthy()
    expect(txtype.getDomainsTxNames().includes('CLAIM_DEF')).toBeTruthy()
    expect(txtype.getDomainsTxNames().includes('REVOC_REG_DEF')).toBeTruthy()
    expect(txtype.getDomainsTxNames().includes('REVOC_REG_ENTRY')).toBeTruthy()
    expect(txtype.getDomainsTxNames().includes('SET_CONTEXT')).toBeTruthy()
  })

  it('should get all pool transaction names', async () => {
    expect(txtype.getPoolTxNames().includes('NODE')).toBeTruthy()
  })

  it('should get all config transaction names', async () => {
    expect(txtype.getConfigTxNames().includes('POOL_UPGRADE')).toBeTruthy()
    expect(txtype.getConfigTxNames().includes('NODE_UPGRADE')).toBeTruthy()
    expect(txtype.getConfigTxNames().includes('POOL_CONFIG')).toBeTruthy()
    expect(txtype.getConfigTxNames().includes('AUTH_RULE')).toBeTruthy()
    expect(txtype.getConfigTxNames().includes('AUTH_RULES')).toBeTruthy()
    expect(txtype.getConfigTxNames().includes('TXN_AUTHOR_AGREEMENT')).toBeTruthy()
    expect(txtype.getConfigTxNames().includes('TXN_AUTHOR_AGREEMENT_AML')).toBeTruthy()
  })
})
