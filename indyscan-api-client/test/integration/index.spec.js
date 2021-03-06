/* eslint-env jest */
require('jest')
const { getTxsV2 } = require('../../src')
const { getTxs } = require('../../src')
const { getTxCount } = require('../../src')
const { getNetwork } = require('../../src')
const { getTx } = require('../../src')
const { getNetworks } = require('../../src')
const { getDefaultNetwork } = require('../../src')
const { loadEnvVariables } = require('./config-loader')

loadEnvVariables()

beforeAll(async () => {
  jest.setTimeout(1000 * 5)
})

/*
This works under assumption you have configured api for at least 1 network with some transactions (let's say 50txs on each subledger).
TODO: We could improve the test suite by preloading some test dataset into ES along with required API configuration to have deterministic testsuite
 */
describe('basic api test suite', () => {
  function basicNetworkValidation (network) {
    expect(network).toBeDefined()
    expect(network.id).toBeDefined()
    expect(network.aliases).toBeDefined()
    expect(network.ui.priority).toBeDefined()
    expect(network.ui.display).toBeDefined()
    expect(network.ui.description).toBeDefined()
  }

  function basicOriginalTxValidation (tx) {
    expect(tx.imeta).toBeDefined()
    expect(tx.imeta.subledger).toBeDefined()
    expect(tx.imeta.seqNo).toBeDefined()
    expect(tx.idata).toBeDefined()
  }

  function serializedTxValidation (tx) {
    expect(tx.imeta).toBeDefined()
    expect(tx.imeta.subledger).toBeDefined()
    expect(tx.imeta.seqNo).toBeDefined()
    expect(tx.idata).toBeDefined()
    expect(tx.idata.json).toBeDefined()
    const ledgerTx = JSON.parse(tx.idata.json)
    expect(ledgerTx.reqSignature).toBeDefined()
    expect(ledgerTx.rootHash).toBeDefined()
    expect(ledgerTx.txn).toBeDefined()
    expect(ledgerTx.txnMetadata).toBeDefined()
  }

  function basicIndyscanTxValidation (tx) {
    expect(tx.imeta).toBeDefined()
    expect(tx.imeta.subledger).toBeDefined()
    expect(tx.imeta.seqNo).toBeDefined()

    expect(tx.idata.txn).toBeDefined()
    expect(tx.idata.txn.type).toBeDefined()
    expect(tx.idata.txn.typeName).toBeDefined()
    expect(tx.idata.txnMetadata).toBeDefined()
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
    const networkId = process.env.NETWORK_ID || networks[0].id
    const tx = await getTx(process.env.API_URL, networkId, 'config', 1, 'serialized')
    basicOriginalTxValidation(tx)
  })

  it('should be case insensitive on subledger name', async () => {
    const networks = await getNetworks(process.env.API_URL)
    const networkId = process.env.NETWORK_ID || networks[0].id
    const tx = await getTx(process.env.API_URL, networkId, 'config', 1, 'serialized')
    serializedTxValidation(tx)
  })

  it('should get config transaction in full format', async () => {
    const networks = await getNetworks(process.env.API_URL)
    const networkId = process.env.NETWORK_ID || networks[0].id
    const tx = await getTx(process.env.API_URL, networkId, 'config', 1, 'full')
    expect(tx.idata.serialized).toBeDefined()
    expect(tx.idata.expansion).toBeDefined()
    serializedTxValidation(tx.idata.serialized)
    basicIndyscanTxValidation(tx.idata.expansion)
  })

  it('should get domain transaction as was found on ledger', async () => {
    const networks = await getNetworks(process.env.API_URL)
    const networkId = process.env.NETWORK_ID || networks[0].id
    const tx = await getTx(process.env.API_URL, networkId, 'domain', 1, 'serialized')
    serializedTxValidation(tx)
  })

  it('should get domain transaction in expansion format', async () => {
    const networks = await getNetworks(process.env.API_URL)
    const networkId = process.env.NETWORK_ID || networks[0].id
    const tx = await getTx(process.env.API_URL, networkId, 'domain', 1, 'expansion')
    basicIndyscanTxValidation(tx)
  })

  it('should get transaction in ledger format by default', async () => {
    const networks = await getNetworks(process.env.API_URL)
    const networkId = process.env.NETWORK_ID || networks[0].id
    const tx = await getTx(process.env.API_URL, networkId, 'pool', 1)
    serializedTxValidation(tx)
  })

  it('should get pool transaction in full format', async () => {
    const networks = await getNetworks(process.env.API_URL)
    const networkId = process.env.NETWORK_ID || networks[0].id
    const tx = await getTx(process.env.API_URL, networkId, 'pool', 1, 'full')
    expect(tx.idata.serialized).toBeDefined()
    expect(tx.idata.expansion).toBeDefined()
    serializedTxValidation(tx.idata.serialized)
    basicIndyscanTxValidation(tx.idata.expansion)
  })

  it('should get transaction count', async () => {
    const networks = await getNetworks(process.env.API_URL)
    const networkId = process.env.NETWORK_ID || networks[0].id
    const count = await getTxCount(process.env.API_URL, networkId, 'domain')
    expect(count).toBeGreaterThan(5)
  })

  it('should have higher total tx count than count of NYM transactions', async () => {
    const networks = await getNetworks(process.env.API_URL)
    const networkId = process.env.NETWORK_ID || networks[0].id
    const countAll = await getTxCount(process.env.API_URL, networkId, 'domain')
    const countNym = await getTxCount(process.env.API_URL, networkId, 'domain', ['NYM'])
    expect(countAll).toBeGreaterThan(countNym)
  })

  it('should get 10 domain transactions', async () => {
    const networks = await getNetworks(process.env.API_URL)
    const networkId = process.env.NETWORK_ID || networks[0].id
    const txs = await getTxs(process.env.API_URL, networkId, 'domain', 0, 10)
    expect(Array.isArray(txs)).toBeTruthy()
    expect(txs.length).toBe(10)
  })

  it('should search NYM transactions containing DID', async () => {
    const networks = await getNetworks(process.env.API_URL)
    const networkId = process.env.NETWORK_ID || networks[0].id
    const txs = await getTxs(process.env.API_URL, networkId, 'domain', 0, 100, ['NYM'], 'full', 'J4N1K1SEB8uY2muwmecY5q')
    expect(Array.isArray(txs)).toBeTruthy()
    for (const tx of txs) {
      expect(JSON.stringify(tx)).toEqual(expect.stringMatching(/J4N1K1SEB8uY2muwmecY5q/))
      expect(tx.indyscan.txn.typeName).toBe('NYM')
    }
  })

  it('should search ATTRIB transactions containing DID', async () => {
    const networks = await getNetworks(process.env.API_URL)
    const networkId = process.env.NETWORK_ID || networks[0].id
    const txs = await getTxs(process.env.API_URL, networkId, 'domain', 0, 100, ['ATTRIB'], 'full', 'J4N1K1SEB8uY2muwmecY5q')
    expect(Array.isArray(txs)).toBeTruthy()
    for (const tx of txs) {
      expect(JSON.stringify(tx)).toEqual(expect.stringMatching(/J4N1K1SEB8uY2muwmecY5q/))
      expect(tx.indyscan.txn.typeName).toBe('ATTRIB')
    }
  })

  it('should search transaction capped by seqNo range', async () => {
    const networks = await getNetworks(process.env.API_URL)
    const networkId = process.env.NETWORK_ID || networks[0].id
    const txs = await getTxsV2(process.env.API_URL, networkId, 'domain', 0, 100, [], 10, 20, 'full')
    expect(Array.isArray(txs)).toBeTruthy()
    expect(txs.length).toBe(10)
    expect(txs.find(tx => tx.idata.expansion.imeta.seqNo === 10)).toBeDefined()
    expect(txs.find(tx => tx.idata.expansion.imeta.seqNo === 19)).toBeDefined()
    expect(txs.find(tx => tx.idata.expansion.imeta.seqNo === 20)).toBeUndefined()
    expect(txs.find(tx => tx.idata.expansion.imeta.seqNo === 9)).toBeUndefined()
  })

  it('should return no transactions if seqNo filter is set as "lt > gte"', async () => {
    const networks = await getNetworks(process.env.API_URL)
    const networkId = process.env.NETWORK_ID || networks[0].id
    const txs = await getTxsV2(process.env.API_URL, networkId, 'domain', 0, 100, [], 20, 10, 'full')
    expect(Array.isArray(txs)).toBeTruthy()
    expect(txs.length).toBe(0)
  })

  it('should return less than filtered seqNo range if "size" parameter is smaller than the range', async () => {
    const networks = await getNetworks(process.env.API_URL)
    const networkId = process.env.NETWORK_ID || networks[0].id
    const txs = await getTxsV2(process.env.API_URL, networkId, 'domain', 0, 2, [], 10, 20, 'full')
    expect(Array.isArray(txs)).toBeTruthy()
    expect(txs.length).toBe(2)
  })

  it('should return transactions of low seqNo cap begins at 0', async () => {
    const networks = await getNetworks(process.env.API_URL)
    const networkId = process.env.NETWORK_ID || networks[0].id
    const txs = await getTxsV2(process.env.API_URL, networkId, 'domain', 0, 2, [], 0, 5, 'full')
    expect(Array.isArray(txs)).toBeTruthy()
    expect(txs.length).toBe(2)
  })
})
