/* eslint-env jest */
const {createNetworkManager} = require('../../src/service/service-networks')

describe('network config manager', () => {
  const standardNetworkConfig = [
    {
      "id": "sovmain",
      "aliases": [
        "SOVRIN_MAINNET"
      ],
      "ui": {
        "priority": 3,
        "display": "MainNet",
        "description": "MainNet is live network for production use."
      },
      "es" : {
        "index": "txs-sovrin_mainnet"
      }
    },
    {
      "id": "sovstaging",
      "ui": {
        "priority": 2,
        "display": "StagingNet",
        "description": "StagingNet is area where end-users of products can test in a pre-production environment."
      },
      "aliases": [
        "SOVRIN_TESTNET"
      ],
      "es" : {
        "index": "txs-sovrin_testnet"
      }
    },
    {
      "id": "sovbuilder",
      "ui": {
        "priority": 1,
        "display": "BuilderNet",
        "description": "BuilderNet is network to try out their product before giving their end-users a go at it."
      },
      "es" : {
        "index": "txs-sovrin_buildernet"
      }
    }
  ]


  const minimalNetworkConfig = [
    {
      "id": "sovmain",
      "es" : {
        "index": "txs-sovrin_mainnet"
      }
    }
  ]

  const missingElasticsearchConfiguration = [
    {
      "id": "sovmain",
      "es" : { }
    }
  ]

  const missingNetworkId = [
    {
      "aliases": [
        "SOVRIN_MAINNET"
      ],
      "ui": {
        "priority": 3,
        "display": "MainNet",
        "description": "MainNet is live network for production use."
      },
      "es" : {
        "index": "txs-sovrin_mainnet"
      }
    }
  ]


  it('should return the first network from config as the default one', async () => {
    const networkManager = createNetworkManager(standardNetworkConfig)
    const defaultNetwork = networkManager.getHighestPrirorityNetwork()
    expect(defaultNetwork.id).toBe('sovmain')
    expect(defaultNetwork.aliases).toContain('SOVRIN_MAINNET')
    expect(defaultNetwork.ui.priority).toBe(3)
    expect(defaultNetwork.ui.display).toBe('MainNet')
    expect(defaultNetwork.ui.description).toBe('MainNet is live network for production use.')
    expect(defaultNetwork.es.index).toBe('txs-sovrin_mainnet')
  })

  it('should return networks ordered by priority', async () => {
    const networkManager = createNetworkManager(standardNetworkConfig)
    const networks = networkManager.getNetworkConfigs()
    expect(networks.length).toBe(3)
    expect(networks[0].id).toBe('sovmain')
    expect(networks[1].id).toBe('sovstaging')
    expect(networks[2].id).toBe('sovbuilder')
  })

  it('should resolve db name by passing network id as reference', async () => {
    const networkManager = createNetworkManager(standardNetworkConfig)
    expect(networkManager.getNetworkConfig('sovmain').id).toBe('sovmain')
  })

  it('should resolve db name by passing network alias as reference', async () => {
    const networkManager = createNetworkManager(standardNetworkConfig)
    expect(networkManager.getNetworkConfig('SOVRIN_MAINNET').id).toBe('sovmain')
  })


  it('should should accept minimal config with only required fields', async () => {
    const networkManager = createNetworkManager(minimalNetworkConfig)
    const defaultNetwork = networkManager.getHighestPrirorityNetwork()
    expect(defaultNetwork.id).toBe('sovmain')
    expect(defaultNetwork.es.index).toBe('txs-sovrin_mainnet')
  })

  it('should add empty alias array if missing in configuration', async () => {
    const networkManager = createNetworkManager(minimalNetworkConfig)
    const defaultNetwork = networkManager.getHighestPrirorityNetwork()
    expect(Array.isArray(defaultNetwork.aliases)).toBeTruthy()
    expect(defaultNetwork.aliases.length).toBe(0)
  })

  it('should assign default network ui.priority of 1', async () => {
    const networkManager = createNetworkManager(minimalNetworkConfig)
    const defaultNetwork = networkManager.getHighestPrirorityNetwork()
    expect(defaultNetwork.ui.priority).toBe(1)
  })

  it('should set ui display ui.name same as ID, if name is missing', async () => {
    const networkManager = createNetworkManager(minimalNetworkConfig)
    const defaultNetwork = networkManager.getHighestPrirorityNetwork()
    expect(defaultNetwork.ui.display).toBe('sovmain')
  })

  it('should generate ui.description if missing in config', async () => {
    const networkManager = createNetworkManager(minimalNetworkConfig)
    const defaultNetwork = networkManager.getHighestPrirorityNetwork()
    expect(defaultNetwork.ui.description).toBe('Hyperledger Indy network sovmain.')
  })

  it('should throw if elasticsearch configuration is missing', async () => {
    expect(createNetworkManager.bind(null, missingElasticsearchConfiguration)).toThrow(" must contain 'es.index'");
  })

  it('should throw if id of network is missing', async () => {
    expect(createNetworkManager.bind(null, missingNetworkId)).toThrow(" must contain 'id'");
  })
})
