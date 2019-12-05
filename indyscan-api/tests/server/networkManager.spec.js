/* eslint-env jest */
const { createNetworkManager } = require('../../server/networkManager')

describe('network config manager', () => {
  const networkConfig = [
    { id: 'sovrin-main-net', db: 'SOVRIN_MAINNET-db', display: 'SOVRIN MAIN NET' },
    { id: 'sovrin-staging-net', db: 'SOVRIN_TESTNET-db', display: 'SOVRIN STAGING NET', aliases: ['SOVRIN_TESTNET'] },
    { id: 'sovrin-builder-net', db: 'SOVRIN_BUILDERNET-db', display: 'SOVRIN BUILDER NET' }
  ]

  it('should return correct db names', async () => {
    const networkManager = createNetworkManager(networkConfig)
    const networks = networkManager.getNetworkDbs()
    expect(networks.length).toBe(3)
    expect(networks[0]).toBe('SOVRIN_MAINNET-db')
    expect(networks[1]).toBe('SOVRIN_TESTNET-db')
    expect(networks[2]).toBe('SOVRIN_BUILDERNET-db')
  })

  it('should return the first network from config as the default one', async () => {
    const networkManager = createNetworkManager(networkConfig)
    expect(networkManager.getDefaultNetworkId()).toBe('sovrin-main-net')
  })

  it('should return correct network ids', async () => {
    const networkManager = createNetworkManager(networkConfig)
    const networks = networkManager.getNetworkDetails()
    expect(networks.length).toBe(3)
    expect(networks[0].id).toBe('sovrin-main-net')
    expect(networks[0].display).toBe('SOVRIN MAIN NET')
    expect(networks[1].id).toBe('sovrin-staging-net')
    expect(networks[1].display).toBe('SOVRIN STAGING NET')
    expect(networks[2].id).toBe('sovrin-builder-net')
    expect(networks[2].display).toBe('SOVRIN BUILDER NET')
  })

  it('should resolve db name by passing network id as reference', async () => {
    const networkManager = createNetworkManager(networkConfig)
    expect(networkManager.getNetworkId('sovrin-main-net')).toBe('SOVRIN_MAINNET-db')
  })

  it('should resolve db name by passing network alias as reference', async () => {
    const networkManager = createNetworkManager(networkConfig)
    expect(networkManager.getNetworkId('SOVRIN_TESTNET')).toBe('SOVRIN_TESTNET-db')
  })
})
