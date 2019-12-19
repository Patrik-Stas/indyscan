const { createTimerLock } = require('../time/scan-timer')
const util = require('util')
const logger = require('../logging/logger-main')
const { runWithTimer } = require('../time/util')

function createConsumerSequential (resolveTx, storageRead, storageWrite, network, subledger, sequentialConsumerConfigData) {
  const whoami = `ConsumerSequential/${network}/${subledger} : `
  const { timeoutOnSuccess, timeoutOnTxIngestionError, timeoutOnLedgerResolutionError, timeoutOnTxNoFound, jitterRatio } =
    sequentialConsumerConfigData
  if (timeoutOnSuccess === undefined ||
    timeoutOnTxIngestionError === undefined ||
    timeoutOnLedgerResolutionError === undefined ||
    timeoutOnTxNoFound === undefined ||
    jitterRatio === undefined) {
    throw Error(`${whoami} Invalid sequential consumer config: ${JSON.stringify(sequentialConsumerConfigData, null, 2)}`)
  }

  let processedTxCount = 0
  let requestCycleCount = 0
  let txNotAvailableCount = 0
  let cycleExceptionCount = 0

  const timerLock = createTimerLock()

  let enabled = true
  let desiredSeqNo

  let processesDuration = {}

  function processDurationResult (processId, duration) {
    if (processesDuration[processId] === undefined) {
      processesDuration[processId] = []
    }
    processesDuration[processId].push(duration)
    if (processesDuration[processId].length > 10) {
      processesDuration[processId].shift()
    }
  }

  function getAverage (list) {
    let sum = list.reduce((a, b) => a + b, 0)
    return sum / list.length || 0
  }

  function getAverageDurations () {
    let avgDurations = {}
    for (const [processName, durations] of Object.entries(processesDuration)) {
      avgDurations[processName] = getAverage(durations)
    }
    return avgDurations
  }

  async function tryConsumeNextTransaction () {
    logger.info(`${whoami} Cycle '${requestCycleCount}' starts.`)
    try {
      logger.info(`${whoami} Average durations ${JSON.stringify(getAverageDurations(), null, 2)}`)
    } catch (e) {
      logger.warn(`${whoami} Error evaluating average durations. ${e.message} ${e.stack}`)
    }

    // find out what do we need
    let desiredSeqNo
    try {
      desiredSeqNo = await storageRead.findMaxSeqNo() + 1
    } catch (e) {
      timerLock.addBlockTime(60 * 1000, jitterRatio)
      logger.info(`${whoami} Cycle '${requestCycleCount}' failed to find out what's the next required seqNo.`)
      return
    }

    // get it
    let tx
    try {
      logger.info(`${whoami}  Cycle '${requestCycleCount}' submitting tx request seqNo='${desiredSeqNo}'.`)
      tx = await resolveTxAndMeasureTime(subledger, desiredSeqNo)
    } catch (e) {
      cycleExceptionCount++
      timerLock.addBlockTime(timeoutOnLedgerResolutionError, jitterRatio)
      logger.error(`${whoami} Cycle '${requestCycleCount}' failed to process tx ${desiredSeqNo}. Details: ${e.message} ${e.stack}`)
      return
    }

    // if we have it, save it
    if (tx) {
      try {
        await addTxAndMeasureTime(tx)
        processedTxCount++
        timerLock.addBlockTime(timeoutOnSuccess, jitterRatio)
        logger.info(`${whoami} Cycle '${requestCycleCount}' processed tx ${desiredSeqNo}.`)
        logger.info(`${whoami} Cycle '${requestCycleCount}' processed tx ${desiredSeqNo}: ${JSON.stringify(tx)}.`)
      } catch (e) {
        cycleExceptionCount++
        timerLock.addBlockTime(timeoutOnTxIngestionError, jitterRatio)
        logger.error(`${whoami} Cycle '${requestCycleCount}' failed to process tx ${desiredSeqNo}. Details: ${e.message} ${e.stack} \n ${util.inspect(e, false, 10)}`)
      }
    } else {
      txNotAvailableCount++
      timerLock.addBlockTime(timeoutOnTxIngestionError, jitterRatio)
      logger.info(`${whoami} Cycle '${requestCycleCount}' found that tx ${desiredSeqNo} does not exist.`)
    }
  }

  async function resolveTxAndMeasureTime (subledger, desiredSeqNo) {
    return runWithTimer(
      async () => resolveTx(subledger, desiredSeqNo),
      (duration) => processDurationResult('tx-resolution', duration)
    )
  }

  async function addTxAndMeasureTime (tx) {
    return runWithTimer(
      async () => storageWrite.addTx(tx),
      (duration) => processDurationResult('tx-storagewrite', duration)
    )
  }

  async function tryConsumeNextTransactionAndWait () {
    await runWithTimer(
      tryConsumeNextTransaction,
      (duration) => processDurationResult('consumption-iteration-active', duration)
    )
    await timerLock.waitTillUnlock()
  }

  async function consumptionCycle () {
    while (enabled) { // eslint-disable-line
      try {
        await runWithTimer(
          tryConsumeNextTransactionAndWait,
          (duration) => processDurationResult('consumption-iteration-full', duration)
        )
      } catch (e) {
        logger.error(`${whoami} FATAL Error. Unhandled error propagated to consumption loop. ${e.message} ${e.stack}. Stopping this consumer.`)
        enabled = false
      } finally {
        requestCycleCount++
      }
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

  return {
    start,
    stop,
    info
  }
}

module.exports.createConsumerSequential = createConsumerSequential
