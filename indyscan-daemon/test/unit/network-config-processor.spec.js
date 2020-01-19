/* eslint-env jest */
const { processScanConfigFile } = require('../../src/config/network-config-processor')
const path = require('path')
const { PRESET_MEDIUM, PRESET_FAST } = require('../../src/config/presets-consumer')

describe('daemon configuration testsuite', () => {
  it('should process fully specified network', async () => {
    const pathToScanConfigFull = path.resolve(__dirname, '../resource/scan_config_full.json')
    let scanConfigs = await processScanConfigFile(pathToScanConfigFull)
    expect(scanConfigs.length).toBe(1)
    const scanConfig = scanConfigs[0]

    expect(scanConfig.name).toBe('sovrin-main')

    expect(scanConfig.consumerConfig).toBeDefined()
    expect(scanConfig.consumerConfig.data).toBeDefined()
    expect(scanConfig.consumerConfig.data.timeoutOnSuccess).toBe(1)
    expect(scanConfig.consumerConfig.data.timeoutOnLedgerResolutionError).toBe(2)
    expect(scanConfig.consumerConfig.data.timeoutOnTxNoFound).toBe(3)
    expect(scanConfig.consumerConfig.data.jitterRatio).toBe(0.4)

    expect(scanConfig.sourceConfig).toBeDefined()
    expect(scanConfig.sourceConfig.type).toBe('ledger')
    expect(scanConfig.sourceConfig.data).toBeDefined()
    expect(scanConfig.sourceConfig.data.name).toBe('SOVRIN_MAINNET')
    expect(scanConfig.sourceConfig.data.genesisPath).toBe('./genesis/SOVRIN_MAINNET.txn')
    expect(scanConfig.sourceConfig.data.genesisPath).toMatch(/indyscan-daemon\/test\/resource\/\.\/genesis\/SOVRIN_MAINNET.txn/)

    expect(scanConfig.storageConfig).toBeDefined()
    expect(scanConfig.storageConfig.type).toBe('elasticsearch')
    expect(scanConfig.storageConfig.data).toBeDefined()
    expect(scanConfig.storageConfig.data.index).toBe('txs-sovrin-mainnet')
    expect(scanConfig.storageConfig.data.replicas).toBe(2)
    expect(scanConfig.storageConfig.data.url).toBe('http://localhost.io:9200')
  })

  it('should override selected preset values if stated explicitly', async () => {
    const pathToConfig = path.resolve(__dirname, '../resource/scan_config_preset_overrides.json')
    let scanConfigs = await processScanConfigFile(pathToConfig)
    expect(scanConfigs.length).toBe(1)
    const scanConfig = scanConfigs[0]

    expect(scanConfig.name).toBe('sovrin-main')

    expect(scanConfig.consumerConfig).toBeDefined()
    expect(scanConfig.consumerConfig.data).toBeDefined()
    expect(scanConfig.consumerConfig.data.timeoutOnSuccess).toBe(123)
    expect(scanConfig.consumerConfig.data.jitterRatio).toBe(0)
    expect(scanConfig.consumerConfig.data.timeoutOnLedgerResolutionError).toBe(PRESET_FAST.timeoutOnLedgerResolutionError)
    expect(scanConfig.consumerConfig.data.timeoutOnTxNoFound).toBe(PRESET_FAST.timeoutOnTxNoFound)
  })

  it('should use default sequential consumer if not specified in config', async () => {
    const configPath = path.resolve(__dirname, '../resource/scan_config_minimal.json')
    let scanConfigs = await processScanConfigFile(configPath)
    expect(scanConfigs.length).toBe(1)
    const scanConfig = scanConfigs[0]

    expect(scanConfig.name).toBe('sovrin-2')
    expect(scanConfig.consumerConfig).toBeDefined()
    expect(scanConfig.consumerConfig.type).toBe('sequential')
    expect(scanConfig.consumerConfig.data.timeoutOnSuccess).toBe(PRESET_MEDIUM.timeoutOnSuccess)
    expect(scanConfig.consumerConfig.data.timeoutOnLedgerResolutionError).toBe(PRESET_MEDIUM.timeoutOnLedgerResolutionError)
    expect(scanConfig.consumerConfig.data.timeoutOnTxNoFound).toBe(PRESET_MEDIUM.timeoutOnTxNoFound)
    expect(scanConfig.consumerConfig.data.jitterRatio).toBe(PRESET_MEDIUM.jitterRatio)
  })

  it('should process minimal scan configuration', async () => {
    const pathToScanConfigFull = path.resolve(__dirname, '../resource/scan_config_minimal.json')
    let scanConfigs = await processScanConfigFile(pathToScanConfigFull)
    expect(scanConfigs.length).toBe(1)
    const scanConfig = scanConfigs[0]

    expect(scanConfig.name).toBe('sovrin-2')

    expect(scanConfig.sourceConfig).toBeDefined()
    expect(scanConfig.sourceConfig.type).toBe('ledger')
    expect(scanConfig.sourceConfig.data.genesisPath).toBe('./genesis/SOVRIN_MAINNET.txn')
    expect(scanConfig.sourceConfig.data.genesisPath).toMatch(/indyscan-daemon\/test\/resource\/\.\/genesis\/SOVRIN_MAINNET.txn/)

    expect(scanConfig.storageConfig).toBeDefined()
    expect(scanConfig.storageConfig.type).toBe('elasticsearch')
    expect(scanConfig.storageConfig.data.index).toBe('txs-sovrin-mainnet')
    expect(scanConfig.storageConfig.data.replicas).toBe(0)
    expect(scanConfig.storageConfig.data.url).toBe('http://localhost:9200')
  })
})
