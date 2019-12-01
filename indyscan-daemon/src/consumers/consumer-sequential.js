const { createTimerLock } = require('../time/scan-timer')

const logger = require('../logging/logger-main')

function createConsumerSequential (resolveTx, indyscanStorage, network, subledger, timerConfig) {
  const whoami = `ConsumerSequential/${network}/${subledger} : `
  const { periodMs, unavailableTimeoutMs, jitterRatio } = timerConfig

  let processedTxCount = 0
  let requestCycleCount = 0
  let txNotAvailableCount = 0
  let cycleExceptionCount = 0

  const timerLock = createTimerLock()

  let enabled = true
  let desiredSeqNo

  async function consumptionCycle () {
    while (enabled) { // eslint-disable-line
      try {
        desiredSeqNo = await indyscanStorage.findMaxSeqNo() + 1
        logger.info(`${whoami}  Cycle '${requestCycleCount}' submitting tx request network='${network}' subledger='${subledger}' seqNo='${desiredSeqNo}'.`)
        let tx = await resolveTx(subledger, desiredSeqNo)
        await indyscanStorage.addTx(tx)
        processedTxCount++
        logger.info(`${whoami} Cycle '${requestCycleCount}' processed tx ${desiredSeqNo}.`)
        logger.info(`${whoami} Cycle '${requestCycleCount}' processed tx ${desiredSeqNo}: ${JSON.stringify(tx)}.`)
        timerLock.addBlockTime(periodMs, jitterRatio)
      } catch (err) {
        cycleExceptionCount++
        timerLock.addBlockTime(unavailableTimeoutMs, jitterRatio)
        logger.error(`${whoami} Cycle '${requestCycleCount}' failed to process tx ${desiredSeqNo}. Details: ${err.message} ${err.stack}`)
      }
      await timerLock.waitTillUnlock()
    }
  }

  function info () {
    return {
      consumerName: whoami,
      desiredSeqNo,
      processedTxCount,
      requestCycleCount,
      txNotAvailableCount,
      cycleExceptionCount
    }
  }

  function start () {
    logger.info(`${whoami}: Starting`)
    enabled = true
    consumptionCycle()
  }

  function stop () {
    enabled = false
  }

  return {
    start,
    stop,
    info
  }
}

module.exports.createConsumerSequential = createConsumerSequential
