const { createTimerLock } = require('../time/scan-timer')
const util = require('util')
const logger = require('../logging/logger-main')

function createConsumerSequential (resolveTx, storageRead, storageWrite, network, subledger, timerConfig) {
  const whoami = `ConsumerSequential/${network}/${subledger} : `
  const { normalTimeoutMs, errorTimeoutMs, timeoutTxNotFoundMs, jitterRatio } = timerConfig

  let processedTxCount = 0
  let requestCycleCount = 0
  let txNotAvailableCount = 0
  let cycleExceptionCount = 0

  const timerLock = createTimerLock()

  let enabled = true
  let desiredSeqNo

  async function consumptionCycle () {
    while (enabled) { // eslint-disable-line
      logger.info(`${whoami}  Cycle '${requestCycleCount}' start.`)
      try {
        let desiredSeqNo = await storageRead.findMaxSeqNo() + 1
        logger.info(`${whoami}  Cycle '${requestCycleCount}' submitting tx request seqNo='${desiredSeqNo}'.`)
        let tx = await resolveTx(subledger, desiredSeqNo)
        if (tx) {
          try {
            await storageWrite.addTx(tx)
            processedTxCount++
            logger.info(`${whoami} Cycle '${requestCycleCount}' processed tx ${desiredSeqNo}.`)
            logger.info(`${whoami} Cycle '${requestCycleCount}' processed tx ${desiredSeqNo}: ${JSON.stringify(tx)}.`)
            timerLock.addBlockTime(normalTimeoutMs, jitterRatio)
          } catch (err) {
            cycleExceptionCount++
            timerLock.addBlockTime(errorTimeoutMs, jitterRatio)
            logger.error(`${whoami} Cycle '${requestCycleCount}' failed to process tx ${desiredSeqNo}. Details: ${err.message} ${err.stack} \n ${util.inspect(err, false, 10)}`)
          }
        } else {
          txNotAvailableCount++
          logger.info(`${whoami} Cycle '${requestCycleCount}' found that tx ${desiredSeqNo} does not exist.`)
          timerLock.addBlockTime(timeoutTxNotFoundMs, jitterRatio)
        }
      } catch (err) {
        cycleExceptionCount++
        timerLock.addBlockTime(errorTimeoutMs, jitterRatio)
        logger.error(`${whoami} Cycle '${requestCycleCount}' failed to process tx ${desiredSeqNo}. Details: ${err.message} ${err.stack}`)
      }
      await timerLock.waitTillUnlock()
      requestCycleCount++
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
    logger.info(`${whoami}: Starting ...`)
    enabled = true
    consumptionCycle()
  }

  function stop () {
    logger.info(`${whoami}: Stopping ...`)
    enabled = false
  }

  return {
    start,
    stop,
    info
  }
}

module.exports.createConsumerSequential = createConsumerSequential
