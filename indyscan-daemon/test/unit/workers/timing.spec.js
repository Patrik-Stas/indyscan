const { getExpandedTimingConfig } = require('../../../src/workers/worker-rtw')
const sleep = require('sleep-promise')

describe('worker timing configuration', () => {
  it('should expand timing configuration', async () => {
    const timing = getExpandedTimingConfig("FAST")
    const expected = {
      "timeoutOnSuccess": 1000,
      "timeoutOnTxIngestionError": 30000,
      "timeoutOnLedgerResolutionError": 30000,
      "timeoutOnTxNoFound": 3000,
      "jitterRatio": 0.1
    }
    expect(timing).toStrictEqual(expected)
  })

  it('should expand timing configuration', async () => {
    const timing = {
      "timeoutOnSuccess": 1234,
      "timeoutOnTxIngestionError": 2345,
      "timeoutOnLedgerResolutionError": 3456,
      "timeoutOnTxNoFound": 9999,
      "jitterRatio": 0.1
    }
    const expandedTimingConfig = getExpandedTimingConfig(timing)
    expect(expandedTimingConfig).toStrictEqual(timing)
  })

  it('should expand missing timing configuration with defaults', async () => {
    const timing = {
      "timeoutOnTxIngestionError": 60000,
      "timeoutOnLedgerResolutionError": 60000,
      "timeoutOnTxNoFound": 9000,
    }
    const expandedTimingConfig = getExpandedTimingConfig(timing)
    const expected = {
      "timeoutOnSuccess": 4000,
      "timeoutOnTxIngestionError": 60000,
      "timeoutOnLedgerResolutionError": 60000,
      "timeoutOnTxNoFound": 9000,
      "jitterRatio": 0.1
    }
    expect(expandedTimingConfig).toStrictEqual(expected)
  })
})
