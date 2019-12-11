/* eslint-env jest */
const { processConfig } = require('../../src/network-config-processor')

let fullConfig = {
  'name': 'sovrin-main',
  'scanning': {
    'mode': 'INDYSCAN.IO'
  },
  'source': {
    'type': 'ledger',
    'data': {
      'genesis': 'SOVRIN_MAINNET'
    }
  },
  'target': {
    'type': 'elasticsearch',
    'data': {
      'index': 'txs-sovrin-mainnet',
      'indexReplicaCount': 2,
      'url': 'http://indyscan.io:9200'
    }
  }
}

let minimalConfig = {
  'name': 'sovrin-2',
  'source': {
    'type': 'ledger',
    'data': {
      'genesis': 'SOVRIN_MAINNET'
    }
  },
  'target': {
    'type': 'elasticsearch',
    'data': {
      'index': 'txs-sovrin-mainnet'
    }
  }
}

describe('daemon configuration testsuite', () => {
  it('should process fully specified network', async () => {
    let { name, scanConfig, sourceConfig, targetConfig } = processConfig(fullConfig, 'http://localhost:9200')
    expect(name).toBe('sovrin-main')
    expect(scanConfig).toBeDefined()
    expect(scanConfig.normalTimeoutMs).toBe(1000)
    expect(scanConfig.errorTimeoutMs).toBe(60 * 1000)
    expect(scanConfig.timeoutTxNotFoundMs).toBe(3000)
    expect(scanConfig.jitterRatio).toBe(0.1)
    expect(sourceConfig).toBeDefined()
    expect(sourceConfig.type).toBe('ledger')
    expect(sourceConfig.data.genesis).toBe('SOVRIN_MAINNET')
    expect(targetConfig).toBeDefined()
    expect(targetConfig.type).toBe('elasticsearch')
    expect(targetConfig.data.index).toBe('txs-sovrin-mainnet')
    expect(targetConfig.data.indexReplicaCount).toBe(2)
    expect(targetConfig.data.url).toBe('http://indyscan.io:9200')
  })

  it('should process fully specified network', async () => {
    let { name, scanConfig, sourceConfig, targetConfig } = processConfig(minimalConfig, 'http://localhost:9200')
    expect(name).toBe('sovrin-2')
    expect(scanConfig).toBeDefined()
    expect(scanConfig.normalTimeoutMs).toBe(6000)
    expect(scanConfig.errorTimeoutMs).toBe(60 * 1000)
    expect(scanConfig.timeoutTxNotFoundMs).toBe(20 * 1000)
    expect(scanConfig.jitterRatio).toBe(0.1)
    expect(sourceConfig).toBeDefined()
    expect(sourceConfig.type).toBe('ledger')
    expect(sourceConfig.data.genesis).toBe('SOVRIN_MAINNET')
    expect(targetConfig).toBeDefined()
    expect(targetConfig.type).toBe('elasticsearch')
    expect(targetConfig.data.index).toBe('txs-sovrin-mainnet')
    expect(targetConfig.data.indexReplicaCount).toBe(0)
    expect(targetConfig.data.url).toBe('http://localhost:9200')
  })
})
