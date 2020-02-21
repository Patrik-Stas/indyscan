/* eslint-env jest */
const path = require('path')
const { appConfigToObjectsConfig } = require('../../../src/config/network-config-processor')
const { loadAppConfigFromFile } = require('../../../src/config/network-config-processor')

const RESOURCE_DIR = path.resolve(__dirname, '../../resource')

describe('configuration loading and processing', () => {
  it('should load raw network configuration from file', async () => {
    const { environment, objects } = await loadAppConfigFromFile(`${RESOURCE_DIR}/sovrin-es-reindex.json`)
    expect(environment).toBeDefined()
    expect(objects).toBeDefined()
  })

  it('raw network config should contain INDY_NETWORK from environment section of config file', async () => {
    const { environment } = await loadAppConfigFromFile(`${RESOURCE_DIR}/config-with-envvariable.json`)
    expect(environment).toBeDefined()
    expect(environment.INDY_NETWORK).toBe('sovrin-mainnet')
  })

  it('raw network config should contain CFGDIR environment variable with value of path to config file', async () => {
    const { environment } = await loadAppConfigFromFile(`${RESOURCE_DIR}/config-with-envvariable.json`)
    expect(environment).toBeDefined()
    expect(environment.CFGDIR).toBe(`${RESOURCE_DIR}`)
  })

  it('should interpolate environment values into objects config', async () => {
    const pathToConfig = `${RESOURCE_DIR}/config-using-cfgdir.json`
    const rawConfig = await loadAppConfigFromFile(pathToConfig)
    let objectsConfig = appConfigToObjectsConfig(rawConfig)
    const expectedObjectsConfig = [
      {
        'interface': 'SOURCE',
        'impl': 'ledger',
        'params': {
          'id': 'source.SOVRIN_MAINNET',
          'name': 'SOVRIN_MAINNET',
          'genesisPath': `${RESOURCE_DIR}/genesis/SOVRIN_MAINNET.txn`
        }
      }
    ]
    expect(JSON.stringify(objectsConfig)).toBe(JSON.stringify(expectedObjectsConfig))
  })
})
