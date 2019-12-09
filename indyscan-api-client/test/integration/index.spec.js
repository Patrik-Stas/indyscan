/* eslint-env jest */
require('jest')
const {getTxs} = require('../../src')
const {getTxCount} = require('../../src')
const {getNetwork} = require('../../src')
const {getTx} = require('../../src')
const {getNetworks} = require('../../src')
const {getDefaultNetwork} = require('../../src')
const {loadEnvVariables} = require('./config-loader')

loadEnvVariables()

beforeAll(async () => {
  jest.setTimeout(1000 * 5)
})

/*
This works under assumption you have configured api for at least 1 network with some transactions (let's say 50txs on each subledger).
TODO: We could improve the test suite by preloading some test dataset into ES along with required API configuration to have deterministic testsuite
 */
describe('basic api test suite', () => {

  function basicNetworkValidation(network) {
    expect(network).toBeDefined()
    expect(network.id).toBeDefined()
    expect(network.aliases).toBeDefined()
    expect(network.ui.priority).toBeDefined()
    expect(network.ui.display).toBeDefined()
    expect(network.ui.description).toBeDefined()
  }

  function basicOriginalTxValidation(tx) {
    expect(tx.rootHash).toBeDefined()
    expect(tx.auditPath).toBeDefined()
    expect(tx.txn).toBeDefined()
    expect(tx.txn.type).toBeDefined()
    expect(tx.txnMetadata).toBeDefined()
  }

  function basicIndyscanTxValidation(tx) {
    expect(tx.rootHash).toBeDefined()
    expect(tx.auditPath).toBeDefined()
    expect(tx.txn).toBeDefined()
    expect(tx.txn.type).toBeDefined()
    expect(tx.txn.typeName).toBeDefined()
    expect(tx.txnMetadata).toBeDefined()
    expect(tx.subledger).toBeDefined()
    expect(tx.meta).toBeDefined()
  }


  it('should get default network', async () => {
    const defaultNetwork = await getDefaultNetwork(process.env.API_URL)
    basicNetworkValidation(defaultNetwork)
  })

  it('should get all networks', async () => {
    const networks = await getNetworks(process.env.API_URL)
    expect(Array.isArray(networks)).toBeTruthy()
    expect(networks.length).toBeGreaterThanOrEqual(1)
    basicNetworkValidation(networks[0])
  })

  it('should get all networks', async () => {
    const networks = await getNetworks(process.env.API_URL)
    expect(Array.isArray(networks)).toBeTruthy()
    expect(networks.length).toBeGreaterThanOrEqual(1)
    basicNetworkValidation(networks[0])
  })

  it('should get network by id', async () => {
    const networks = await getNetworks(process.env.API_URL)
    expect(Array.isArray(networks)).toBeTruthy()
    expect(networks.length).toBeGreaterThanOrEqual(1)
    const firstNetwork = networks[0]
    const network = await getNetwork(process.env.API_URL, firstNetwork.id)
    expect(JSON.stringify(network)).toBe(JSON.stringify(firstNetwork))
  })

  it('should get network by alias', async () => {
    const networks = await getNetworks(process.env.API_URL)
    expect(Array.isArray(networks)).toBeTruthy()
    expect(networks.length).toBeGreaterThanOrEqual(1)
    const firstNetwork = networks[0]
    expect(firstNetwork.aliases.length).toBeGreaterThanOrEqual(1)
    const network = await getNetwork(process.env.API_URL, firstNetwork.aliases[0])
    expect(JSON.stringify(network)).toBe(JSON.stringify(firstNetwork))
  })

  it('should get config transaction as was found on ledger', async () => {
    const networks = await getNetworks(process.env.API_URL)
    const firstNetworkId = networks[0].id
    let tx = await getTx(process.env.API_URL, firstNetworkId, 'CONFIG', 1, 'original')
    basicOriginalTxValidation(tx)
  })

  it('should be case insensitive on subledger name', async () => {
    const networks = await getNetworks(process.env.API_URL)
    const firstNetworkId = networks[0].id
    let tx = await getTx(process.env.API_URL, firstNetworkId, 'conFIG', 1, 'original')
    basicOriginalTxValidation(tx)
  })

  it('should get config transaction in indyscan format', async () => {
    const networks = await getNetworks(process.env.API_URL)
    const firstNetworkId = networks[0].id
    const tx = await getTx(process.env.API_URL, firstNetworkId, 'config', 1, 'full')
    expect(tx.original).toBeDefined()
    const originalTxParsed = JSON.parse(tx.original)
    basicOriginalTxValidation(originalTxParsed)
    expect(tx.indyscan).toBeDefined()
    basicIndyscanTxValidation(tx.indyscan)
  })

  it('should get domain transaction as was found on ledger', async () => {
    const networks = await getNetworks(process.env.API_URL)
    const firstNetworkId = networks[0].id
    let tx = await getTx(process.env.API_URL, firstNetworkId, 'domain', 1, 'original')
    basicOriginalTxValidation(tx)
  })

  it('should get domain transaction in indyscan format', async () => {
    const networks = await getNetworks(process.env.API_URL)
    const firstNetworkId = networks[0].id
    const tx = await getTx(process.env.API_URL, firstNetworkId, 'domain', 1, 'full')
    expect(tx.original).toBeDefined()
    const originalTxParsed = JSON.parse(tx.original)
    basicOriginalTxValidation(originalTxParsed)
    expect(tx.indyscan).toBeDefined()
    basicIndyscanTxValidation(tx.indyscan)
  })

  it('should get transaction in ledger format by default', async () => {
    const networks = await getNetworks(process.env.API_URL)
    const firstNetworkId = networks[0].id
    let tx = await getTx(process.env.API_URL, firstNetworkId, 'pool', 1)
    basicOriginalTxValidation(tx)
  })

  it('should get transaction in ledger format', async () => {
    const networks = await getNetworks(process.env.API_URL)
    const firstNetworkId = networks[0].id
    let tx = await getTx(process.env.API_URL, firstNetworkId, 'pool', 1, 'original')
    basicOriginalTxValidation(tx)
  })

  it('should get pool transaction in indyscan format', async () => {
    const networks = await getNetworks(process.env.API_URL)
    const firstNetworkId = networks[0].id
    const tx = await getTx(process.env.API_URL, firstNetworkId, 'pool', 1, 'full')
    expect(tx.original).toBeDefined()
    const originalTxParsed = JSON.parse(tx.original)
    basicOriginalTxValidation(originalTxParsed)
    expect(tx.indyscan).toBeDefined()
    basicIndyscanTxValidation(tx.indyscan)
  })

  it('should get transaction count', async () => {
    const networks = await getNetworks(process.env.API_URL)
    const firstNetworkId = networks[0].id
    let count = await getTxCount(process.env.API_URL, firstNetworkId, 'domain')
    expect(count).toBeGreaterThan(5)
  })

  it('should have higher total tx count than count of NYM transactions', async () => {
    const networks = await getNetworks(process.env.API_URL)
    const firstNetworkId = networks[0].id
    let countAll = await getTxCount(process.env.API_URL, firstNetworkId, 'domain')
    let countNym = await getTxCount(process.env.API_URL, firstNetworkId, 'domain', ['NYM'])
    expect(countAll).toBeGreaterThan(countNym)
  })

  it('should have higher total tx count than count of NYM transactions', async () => {
    const networks = await getNetworks(process.env.API_URL)
    const firstNetworkId = networks[0].id
    let txs = await getTxs(process.env.API_URL, firstNetworkId, 'domain', 0, 10)
    expect(Array.isArray(txs)).toBeTruthy()
    expect(txs.length).toBe(10)
  })

  it('should search NYM transactions containing DID', async () => {
    const networks = await getNetworks(process.env.API_URL)
    const firstNetworkId = networks[0].id
    let txs = await getTxs(process.env.API_URL, firstNetworkId, 'domain', 0, 100, ['NYM'], 'full', 'J4N1K1SEB8uY2muwmecY5q')
    expect(Array.isArray(txs)).toBeTruthy()
    for (const tx of txs) {
      expect(JSON.stringify(tx)).toEqual(expect.stringMatching(/J4N1K1SEB8uY2muwmecY5q/))
      expect(tx.indyscan.txn.typeName).toBe("NYM")
    }
  })

  it('should find 2 NYM transactions containing DID', async () => {
    const networks = await getNetworks(process.env.API_URL)
    const firstNetworkId = networks[0].id
    let txs = await getTxs(process.env.API_URL, firstNetworkId, 'domain', 0, 2, ['NYM'], 'full', 'J4N1K1SEB8uY2muwmecY5q')
    expect(Array.isArray(txs)).toBeTruthy()
    expect(txs.length).toBe(2)
    for (const tx of txs) {
      expect(JSON.stringify(tx)).toEqual(expect.stringMatching(/J4N1K1SEB8uY2muwmecY5q/))
      expect(tx.indyscan.txn.typeName).toBe("NYM")
    }
  })

  it('should search ATTRIB transactions containing DID', async () => {
    const networks = await getNetworks(process.env.API_URL)
    const firstNetworkId = networks[0].id
    let txs = await getTxs(process.env.API_URL, firstNetworkId, 'domain', 0, 100, ['ATTRIB'], 'full', 'J4N1K1SEB8uY2muwmecY5q')
    expect(Array.isArray(txs)).toBeTruthy()
    for (const tx of txs) {
      expect(JSON.stringify(tx)).toEqual(expect.stringMatching(/J4N1K1SEB8uY2muwmecY5q/))
      expect(tx.indyscan.txn.typeName).toBe("ATTRIB")
    }
  })
})
