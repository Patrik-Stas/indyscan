const {createTimerLock} = require('../time/scan-timer')
const util = require('util')
const logger = require('../logging/logger-main')
const {getDefaultPreset} = require('../config/presets-consumer')
const {resolvePreset} = require('../config/presets-consumer')
const {runWithTimer} = require('../time/util')

function getExpandedTimingConfig (providedTimingSetup) {
  let presetData
  if (!providedTimingSetup || (typeof providedTimingSetup !== 'string')) {
    presetData = getDefaultPreset()
  } else {
    presetData = resolvePreset(providedTimingSetup) || getDefaultPreset()
  }
  return Object.assign(presetData, providedTimingSetup)
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

function createWorkerRtw ({id, subledger, iterator, iteratorTxFormat, transformers, target, timing = undefined}) {
  timing = getExpandedTimingConfig(timing)
  validateTimingConfig(timing)
  const {timeoutOnSuccess, timeoutOnTxIngestionError, timeoutOnLedgerResolutionError, timeoutOnTxNoFound, jitterRatio} = timing
  logger.info(`Pipeline ${id} using iterator ${iterator.getObjectId}`)


  let processedTxCount = 0
  let requestCycleCount = 0
  let txNotAvailableCount = 0
  let cycleExceptionCount = 0

  const timerLock = createTimerLock()

  let enabled = true

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

  async function processTransaction(txData, txFormat) {
    let txDataProcessed = txData
    let txDataProcessedFormat = txFormat
    try {
      let result = await transformer.processTx(txDataProcessed)
      txDataProcessed = result.processedTx
      txDataProcessedFormat = result.format
    } catch (e) {
      throw Error(`${id} Stopping pipeline as cycle '${requestCycleCount}' critically failed to transform tx `
        + `${JSON.stringify(txMeta)} using transformer ${transformer.getObjectId()}. Details: ${e.message} ${e.stack}`)
    }
    if (!txDataProcessed) {
      throw Error(`${id} Stopping pipeline on critical error. transformer ${transformer.getObjectId()} did `
        + `not return any data. Input transaction ${JSON.stringify(txMeta)}: ${JSON.stringify(txData)}`)
    }
    if (!txDataProcessedFormat) {
      throw Errror(`${id} Stopping pipeline on critical error. transformer  ${transformer.getObjectId()} `
        + `did format of its output txData.`)
    }
  }

  /*
  Might throw on critical error. Throwing here will lead to stopping worker.
   */
  async function tryConsumeNextTransaction () {
    logger.info(`${id} Cycle '${requestCycleCount}' starts.`)
    try {
      logger.info(`${id} Average durations ${JSON.stringify(getAverageDurations(), null, 2)}`)
    } catch (e) {
      logger.warn(`${id} Error evaluating average durations. ${e.message} ${e.stack}`)
    }

    // get it
    let txData, txMeta
    try {
      logger.info(`${id}  Cycle '${requestCycleCount}' requesting next transaction.`)
      let res = await getNextTxTimed(subledger, iteratorTxFormat)
      if (!res) {
        timerLock.addBlockTime(timeoutOnTxNoFound, jitterRatio)
        logger.warn(`${id} Cycle '${requestCycleCount}': iterator exhausted.`)
        return
      }
      let {tx, meta} = res
      txData = tx
      txMeta = meta
    } catch (e) {
      cycleExceptionCount++
      timerLock.addBlockTime(timeoutOnLedgerResolutionError, jitterRatio)
      logger.error(`${id} Cycle '${requestCycleCount}' failed to resolve next tx. Details: ${e.message} ${e.stack}`)
      return
    }

    if (!txMeta || !txMeta.subledger || !txMeta.seqNo || !txMeta.format) {
      throw Error(`${id} Stopping pipeline on critical error. Iterator did not return sufficient meta information` +
        `about tx. Meta ${JSON.stringify(txMeta)}`)
    }

    // was available?
    if (!txData) {
      txNotAvailableCount++
      timerLock.addBlockTime(timeoutOnTxNoFound, jitterRatio)
      logger.warn(`${id} Cycle '${requestCycleCount}' was trying to get transaction ${JSON.stringify(txMeta)} but it's not available.`)
      return
    }

    // process it
    const {processedTx, format: txDataProcessedFormat} = await processTransaction(txData, txMeta.format);

    try {
      await addTxTimed(txMeta.subledger, txMeta.seqNo, txDataProcessedFormat, processedTx)
      processedTxCount++
      timerLock.addBlockTime(timeoutOnSuccess, jitterRatio)
      logger.info(`${id} Cycle '${requestCycleCount}' processed tx ${JSON.stringify(txMeta)}.`)
    } catch (e) {
      cycleExceptionCount++
      timerLock.addBlockTime(timeoutOnTxIngestionError, jitterRatio)
      logger.error(`${id} Cycle '${requestCycleCount}' failed to store tx ${JSON.stringify(txMeta)}. ` +
        `Details: ${e.message} ${e.stack} \n ${util.inspect(e, false, 10)}`)
    }
  }

  async function getNextTxTimed (subledger, format) {
    return runWithTimer(
      async () => iterator.getNextTx(subledger, format),
      (duration) => processDurationResult('tx-resolution', duration)
    )
  }

  async function addTxTimed (subledger, seqNo, format, txData) {
    return runWithTimer(
      async () => target.addTxData(subledger, seqNo, format, txData),
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
        logger.error(`${id} Critical Error. Unhandled error propagated to consumption loop. ${e.message} ${e.stack}. Stopping this consumer.`)
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

module.exports.createWorkerRtw = createWorkerRtw
