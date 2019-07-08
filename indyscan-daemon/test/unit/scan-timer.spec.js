/* eslint-env jest */
const { createTimerLock } = require('../../src/scan-timer')
const sleep = require('sleep-promise')

describe('ledger tx resolution', () => {
  it('if previous wait session expires, new one should be started on new block timed added', async () => {
    const timerLock = createTimerLock()
    timerLock.addBlockTime(200)
    await sleep(300)
    timerLock.addBlockTime(200)
    const utime1 = Math.floor(new Date() / 1)
    await timerLock.waitTillUnlock()
    const utime2 = Math.floor(new Date() / 1)
    expect(utime2 - utime1).toBeGreaterThanOrEqual(200)
    expect(utime2 - utime1).toBeLessThan(250)
  })

  it('adding block time multiple times should prolong a single wait', async () => {
    const timerLock = createTimerLock()
    timerLock.addBlockTime(200)
    await sleep(100)
    timerLock.addBlockTime(200)
    const utime1 = Math.floor(new Date() / 1)
    await timerLock.waitTillUnlock()
    const utime2 = Math.floor(new Date() / 1)
    expect(utime2 - utime1).toBeGreaterThanOrEqual(300)
    expect(utime2 - utime1).toBeLessThan(350)
  })

  it('should not matter when the timer clock was created', async () => {
    const timerLock = createTimerLock()
    await sleep(260)
    const utime1 = Math.floor(new Date() / 1)
    timerLock.addBlockTime(200)
    await timerLock.waitTillUnlock()
    const utime2 = Math.floor(new Date() / 1)
    expect(utime2 - utime1).toBeGreaterThanOrEqual(200)
    expect(utime2 - utime1).toBeLessThan(300)
  })

  it('it should block for given amount of itme', async () => {
    const timerLock = createTimerLock()
    const utime1 = Math.floor(new Date() / 1)
    timerLock.addBlockTime(200)
    await timerLock.waitTillUnlock()
    const utime2 = Math.floor(new Date() / 1)
    expect(utime2 - utime1).toBeGreaterThanOrEqual(200)
    expect(utime2 - utime1).toBeLessThan(250)
  })

  it('should not block if no additional block time added', async () => {
    const timerLock = createTimerLock()
    const utime1 = Math.floor(new Date() / 1)
    timerLock.addBlockTime(200)
    await timerLock.waitTillUnlock()
    await timerLock.waitTillUnlock()
    await timerLock.waitTillUnlock()
    const utime2 = Math.floor(new Date() / 1)
    expect(utime2 - utime1).toBeGreaterThanOrEqual(200)
    expect(utime2 - utime1).toBeLessThan(250)
  })
})
