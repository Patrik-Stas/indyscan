const { jitterize } = require('./util')
const sleep = require('sleep-promise')

function createTimerLock () {
  let unlockUtime = Math.floor(new Date() / 1)

  function getMsTillUnlock () {
    return unlockUtime - Math.floor(new Date() / 1)
  }

  function isBlocked () {
    return getMsTillUnlock() > 0
  }

  function addBlockTime (blockTimeMs, jitterRatio = 0) {
    const addedBlockTime = jitterize(blockTimeMs, jitterRatio)
    if (isBlocked()) {
      unlockUtime += addedBlockTime
    } else {
      unlockUtime = Math.floor(new Date() / 1) + addedBlockTime
    }
  }

  async function waitTillUnlock () {
    let msTillUnlock = getMsTillUnlock()
    while (msTillUnlock > 0) {
      await sleep(msTillUnlock)
      msTillUnlock = getMsTillUnlock()
    }
  }

  return {
    addBlockTime,
    waitTillUnlock
  }
}

module.exports.createTimerLock = createTimerLock
