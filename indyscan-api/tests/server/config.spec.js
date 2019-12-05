/* eslint-env jest */
const { loadV1Config, loadV2Config } = require('../../server/config')

describe('configuration processing', () => {
  it('should create config object from v1 config style', async () => {
    const config = loadV1Config('net1,foobar')
    expect(config.length).toBe(2)
    expect(config[0].id).toBe('net1')
    expect(config[0].db).toBe('net1')
    expect(config[0].display).toBe('net1')
    expect(config[1].id).toBe('foobar')
    expect(config[1].db).toBe('foobar')
    expect(config[1].display).toBe('foobar')
  })

  it('should create config object from v2 config style', async () => {
    const configInputAsObj = [
      { id: 'sovrin-main-net', db: 'SOVRIN_MAINNET', display: 'SOVRIN MAIN NET' },
      { id: 'sovrin-staging-net', db: 'SOVRIN_TESTNET', display: 'SOVRIN STAGING NET', aliases: ['SOVRIN_TESTNET'] },
      { id: 'sovrin-builder-net', db: 'SOVRIN_BUILDERNET', display: 'SOVRIN BUILDER NET' }
    ]
    const config = loadV2Config(JSON.stringify(configInputAsObj))
    expect(config.length).toBe(3)
    expect(config[0].id).toBe('sovrin-main-net')
    expect(config[0].db).toBe('SOVRIN_MAINNET')
    expect(config[0].display).toBe('SOVRIN MAIN NET')
    expect(config[1].id).toBe('sovrin-staging-net')
    expect(config[1].db).toBe('SOVRIN_TESTNET')
    expect(config[1].display).toBe('SOVRIN STAGING NET')
    expect(config[1].aliases.length).toBe(1)
    expect(config[1].aliases[0]).toBe('SOVRIN_TESTNET')
  })
})
