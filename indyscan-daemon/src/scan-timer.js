const { jitterize } = require('./util')
const sleep = require('sleep-promise')
const logger = require('./logging/logger-main')

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
      logger.info(`Timer lock blocking for '${msTillUnlock}' ms.`)
      await sleep(msTillUnlock)
      msTillUnlock = getMsTillUnlock()
    }
  }

  return {
    getMsTillUnlock,
    addBlockTime,
    waitTillUnlock
  }
}

module.exports.createTimerLock = createTimerLock
