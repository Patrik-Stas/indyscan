import { createLedgerStorageManager } from '../src'

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

  it('should get transactions of only certain type', async () => {
    const txs = await ledgerManager.getLedger(INDY_NETWORK, 'domain').getTxRange(0, 10, { 'txn.type': '102' })
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
})

