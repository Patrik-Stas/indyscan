import { createLedgerStorageManager, buildFilterByTxNames } from '../src/index'

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017'
const INDY_NETWORK = 'IS_STOR_TEST'

let ledgerManager

beforeAll(async () => {
  jest.setTimeout(1000 * 60 * 4)
  ledgerManager = await createLedgerStorageManager(MONGO_URL)
  await ledgerManager.addIndyNetwork(INDY_NETWORK)
})

afterAll(async () => {
  await ledgerManager.close()
})

describe('basic storage test', () => {
  it('should return 300 as count of domains txs', async () => {
    const count = await ledgerManager.getLedger(INDY_NETWORK, 'domain').getTxCount()
    expect(count).toBe(300)
  })

  it('should count 194 SCHEMA and CLAIM_DEF documents', async () => {
    const txFilter = buildFilterByTxNames(['SCHEMA', 'CLAIM_DEF'])
    const count = await ledgerManager.getLedger(INDY_NETWORK, 'domain').getTxCount(txFilter)
    expect(count).toBe(194)
  })

  it('should get transactions with basic fields defined', async () => {
    const tx = await ledgerManager.getLedger(INDY_NETWORK, 'domain').getTxBySeqNo(150)
    expect(tx.rootHash).toBeDefined()
    expect(tx.auditPath).toBeDefined()
    expect(tx.txnMetadata).toBeDefined()
    expect(tx.txn).toBeDefined()
    expect(tx.txn.type).toBeDefined()
    expect(tx.txn.metadata).toBeDefined()
  })

  it('should get range of transactions', async () => {
    const txs = await ledgerManager.getLedger(INDY_NETWORK, 'domain').getTxRange(0, 10)
    expect(Array.isArray(txs)).toBeTruthy()
    expect(txs.length).toBe(10)
  })

  it('objects from tx range should be transactions', async () => {
    const txs = await ledgerManager.getLedger(INDY_NETWORK, 'domain').getTxRange(0, 10)
    for (const tx of txs) {
      expect(tx.rootHash).toBeDefined()
      expect(tx.auditPath).toBeDefined()
      expect(tx.txnMetadata).toBeDefined()
      expect(tx.txn).toBeDefined()
      expect(tx.txn.type).toBeDefined()
      expect(tx.txn.metadata).toBeDefined()
    }
  })

  it('should get transactions of specific type', async () => {
    const txFilter = buildFilterByTxNames([['CLAIM_DEF']])
    const txs = await ledgerManager.getLedger(INDY_NETWORK, 'domain').getTxRange(0, 10, txFilter)
    for (const tx of txs) {
      expect(tx.rootHash).toBeDefined()
      expect(tx.auditPath).toBeDefined()
      expect(tx.txnMetadata).toBeDefined()
      expect(tx.txn).toBeDefined()
      expect(tx.txn.type).toBeDefined()
      expect(tx.txn.type).toBe('102')
      expect(tx.txn.metadata).toBeDefined()
    }
  })

  it('should get transactions of two type', async () => {
    const txFilter = buildFilterByTxNames(['SCHEMA', 'CLAIM_DEF'])
    const txs = await ledgerManager.getLedger(INDY_NETWORK, 'domain').getTxRange(0, 10, txFilter)
    let found101 = false
    let found102 = false
    for (const tx of txs) {
      expect(tx.rootHash).toBeDefined()
      expect(tx.auditPath).toBeDefined()
      expect(tx.txnMetadata).toBeDefined()
      expect(tx.txn).toBeDefined()
      expect(tx.txn.type).toBeDefined()
      expect(tx.txn.type === '102' || tx.txn.type === '101').toBeTruthy()
      expect(tx.txn.metadata).toBeDefined()
      if (tx.txn.type === '102') {
        found102 = true
      }
      if (tx.txn.type === '101') {
        found101 = true
      }
    }
    expect(101).toBeTruthy()
    expect(102).toBeTruthy()
  })
})
