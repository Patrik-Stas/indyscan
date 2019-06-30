import { jitterize } from './util'
const sleep = require('sleep-promise')

export async function createTimerLock (config) {
  const { frequencySec, unavailableExtraTimeout, jitterRatio } = config

  let unlockUtime = Date.now()

  function timeoutBlock () {
    unlockUtime += jitterize(frequencySec, jitterRatio)
  }

  function frequencyBlock () {
    unlockUtime += jitterize(unavailableExtraTimeout, jitterRatio)
  }

  async function waitTillUnlock () {
    let msTillUnlock = unlockUtime - Date.now()
    while (msTillUnlock > 0) {
      await sleep(msTillUnlock)
      msTillUnlock = unlockUtime - Date.now()
    }
  }

  return {
    timeoutBlock,
    frequencyBlock,
    waitTillUnlock
  }
}
