/* eslint-env jest */
const { jitterize, runWithTimer } = require('../src/time/util')
const sleep = require('sleep-promise')

describe('configuration processing', () => {
  it('should not cross jitter bounds in 1000 test iterations', async () => {
    for (let i = 0; i < 1000; i++) {
      const res = jitterize(10, 0.1)
      expect(res >= 0.9).toBe(true)
      expect(res <= 11).toBe(true)
    }
  })

  it('should measure duration of a function running and return result', async () => {
    let calculation = async () => { await sleep(100); return 12345 }
    let reportedData
    let reportCallback = (duration) => {
      reportedData = duration
    }
    let result = await runWithTimer(calculation, reportCallback)
    expect(result).toBe(12345)
    await sleep(200)
    expect(reportedData).toBeGreaterThanOrEqual(100)
    expect(reportedData).toBeLessThan(120)
  })

  it('should return result from timed function even if result callback throws', async () => {
    let calculation = async () => { await sleep(100); return 12345 }
    let reportCallback = (duration) => {
      throw Error(`Simulated problem processing duration result ${duration}`)
    }
    let result = await runWithTimer(calculation, reportCallback)
    expect(result).toBe(12345)
  })

  it('should throw and never call result callback if main timed closure throws', async () => {
    let calculation = async () => { await sleep(1); throw Error(`Simulated calculation failure.`) }
    let reportedData
    let reportCallback = (duration) => {
      reportedData = duration
    }
    let threw = false
    try {
      await runWithTimer(calculation, reportCallback)
    } catch (e) {
      threw = true
    }
    expect(threw).toBeTruthy()
    expect(reportedData).toBe(undefined)
  })
})
