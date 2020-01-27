const {createTimerLock} = require('../time/scan-timer')
const util = require('util')
const logger = require('../logging/logger-main')
const {resolvePreset} = require('../config/presets-consumer')
const {runWithTimer} = require('../time/util')

function getExpandedTimingConfig (providedTimingSetup) {
  let presetData
  if (!providedTimingSetup || (typeof providedTimingSetup !== 'string')) {
    presetData = getDefaultPreset()
  } else {
    presetData = resolvePreset(providedTimingSetup) || getDefaultPreset()
  }
  return Object.assign(presetData, expendedStorageConfig.data)
}

function validateTimingConfig (timingConfig) {
  const {timeoutOnSuccess, timeoutOnTxIngestionError, timeoutOnLedgerResolutionError, timeoutOnTxNoFound, jitterRatio} = timingConfig
  if (timeoutOnSuccess === undefined) {
    throw Error(`Timing config is missing 'timeoutOnSuccess'.`)
  }
  if (timeoutOnTxIngestionError === undefined) {
    throw Error(`Timing config is missing 'timeoutOnTxIngestionError'.`)
  }
  if (timeoutOnLedgerResolutionError === undefined) {
    throw Error(`Timing config is missing 'timeoutOnLedgerResolutionError'.`)
  }
  if (timeoutOnTxNoFound === undefined) {
    throw Error(`Timing config is missing 'timeoutOnTxNoFound'.`)
  }
  if (jitterRatio === undefined) {
    throw Error(`Timing config is missing 'jitterRatio'.`)
  }
}

function createPipelineSequential ({id, subledger, iterator, processor, target, timing = undefined}) {
  timing = getExpandedTimingConfig(timing)
  validateTimingConfig(timing)

  // TODO
  // make sure the target is initialized by processor's instructions somehow

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
    logger.info(`${id} Cycle '${requestCycleCount}' starts.`)
    try {
      logger.info(`${id} Average durations ${JSON.stringify(getAverageDurations(), null, 2)}`)
    } catch (e) {
      logger.warn(`${id} Error evaluating average durations. ${e.message} ${e.stack}`)
    }

    // find out what do we need
    let desiredSeqNo
    try {
      desiredSeqNo = await iterator.findMaxSeqNo() + 1
    } catch (e) {
      timerLock.addBlockTime(60 * 1000, jitterRatio)
      logger.info(`${id} Cycle '${requestCycleCount}' failed to find out what's the next required seqNo.`)
      return
    }

    // get it
    let tx
    try {
      logger.info(`${id}  Cycle '${requestCycleCount}' submitting tx request seqNo='${desiredSeqNo}'.`)
      tx = await resolveTxAndMeasureTime(subledger, desiredSeqNo)
    } catch (e) {
      cycleExceptionCount++
      timerLock.addBlockTime(timeoutOnLedgerResolutionError, jitterRatio)
      logger.error(`${id} Cycle '${requestCycleCount}' failed to resolve tx ${desiredSeqNo}. Details: ${e.message} ${e.stack}`)
      return
    }

    // process it
    try {
      let procssedTx = await processor.process(tx)
    } catch (e) {
      logger.error(`${id} Cycle '${requestCycleCount}' failed to process tx ${desiredSeqNo}. Details: ${e.message} ${e.stack}`)
    }

    // save it
    if (tx) {
      try {
        await addTxAndMeasureTime(tx)
        processedTxCount++
        timerLock.addBlockTime(timeoutOnSuccess, jitterRatio)
        logger.info(`${id} Cycle '${requestCycleCount}' processed tx ${desiredSeqNo}.`)
        logger.info(`${id} Cycle '${requestCycleCount}' processed tx ${desiredSeqNo}: ${JSON.stringify(tx)}.`)
      } catch (e) {
        cycleExceptionCount++
        timerLock.addBlockTime(timeoutOnTxIngestionError, jitterRatio)
        logger.error(`${id} Cycle '${requestCycleCount}' failed to store tx ${desiredSeqNo}. Details: ${e.message} ${e.stack} \n ${util.inspect(e, false, 10)}`)
      }
    } else {
      txNotAvailableCount++
      timerLock.addBlockTime(timeoutOnTxIngestionError, jitterRatio)
      logger.info(`${id} Cycle '${requestCycleCount}' found that tx ${desiredSeqNo} does not exist.`)
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
      async () => target.addTx(tx),
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
        logger.error(`${id} FATAL Error. Unhandled error propagated to consumption loop. ${e.message} ${e.stack}. Stopping this consumer.`)
        enabled = false
      } finally {
        requestCycleCount++
      }
    }
  }

  function start () {
    logger.info(`${id}: Starting ...`)
    enabled = true
    consumptionCycle()
  }

  function stop () {
    logger.info(`${id}: Stopping ...`)
    enabled = false
  }

  function info () {
    return {
      consumerName: id,
      desiredSeqNo,
      processedTxCount,
      requestCycleCount,
      txNotAvailableCount,
      cycleExceptionCount
    }
  }

  function getObjectId () {
    return id
  }

  return {
    getObjectId,
    start,
    stop,
    info
  }
}

module.exports.createPipelineSequential = createPipelineSequential
