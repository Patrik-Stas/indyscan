const { createTimerLock } = require('../time/scan-timer')
const util = require('util')
const logger = require('../logging/logger-main')
const { getDefaultPreset } = require('../config/presets-consumer')
const { resolvePreset } = require('../config/presets-consumer')
const { runWithTimer } = require('../time/util')
const sleep = require('sleep-promise')

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
  const { timeoutOnSuccess, timeoutOnTxIngestionError, timeoutOnLedgerResolutionError, timeoutOnTxNoFound, jitterRatio } = timingConfig
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

async function createWorkerRtw ({ indyNetworkId, componentId, subledger, iterator, iteratorTxFormat, transformer, target, timing, operationId }) {
  const loggerMetadata = {
    metadaemon: {
      indyNetworkId,
      componentType: 'worker-rtw',
      componentId,
      operationId,
      workerRtwOutputFormat: transformer.getOutputFormat()
    }
  }

  if (!componentId) {
    const errMsg = `WorkerRTW missing id parameter.`
    logger.error(errMsg, loggerMetadata)
    throw Error(errMsg)
  }
  if (!subledger) {
    const errMsg = `WorkerRTW missing subledger parameter.`
    logger.error(errMsg, loggerMetadata)
    throw Error(errMsg)
  }
  if (!iterator) {
    const errMsg = `WorkerRTW missing iterator parameter.`
    logger.error(errMsg, loggerMetadata)
    throw Error(errMsg)
  }
  if (!iteratorTxFormat) {
    const errMsg = `WorkerRTW missing iteratorTxFormat parameter.`
    logger.error(errMsg, loggerMetadata)
    throw Error(errMsg)
  }
  if (!transformer) {
    const errMsg = `WorkerRTW missing transformer parameter.`
    logger.error(errMsg, loggerMetadata)
    throw Error(errMsg)
  }
  if (!target) {
    const errMsg = `WorkerRTW missing target parameter.`
    logger.error(errMsg, loggerMetadata)
    throw Error(errMsg)
  }
  timing = getExpandedTimingConfig(timing)
  validateTimingConfig(timing)
  const { timeoutOnSuccess, timeoutOnTxIngestionError, timeoutOnLedgerResolutionError, timeoutOnTxNoFound, jitterRatio } = timing
  logger.info(`Pipeline ${componentId} using iterator ${iterator.getObjectId()}`, loggerMetadata)

  let initialzed = false

  async function initialize () {
    await transformer.initializeTarget(target)
    initialzed = true
  }

  await initialize()

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

  async function processTransaction (txData, txFormat) {
    let processedTx = txData
    let txDataProcessedFormat = txFormat
    try {
      let result = await transformer.processTx(processedTx)
      processedTx = result.processedTx
      txDataProcessedFormat = result.format
    } catch (e) {
      const errMsg = `Stopping pipeline as cycle '${requestCycleCount}' critically failed to transform tx ` +
        `${JSON.stringify(txData)} using transformer ${transformer.getObjectId()}. Details: ${e.message} ${e.stack}`
      logger.error(errMsg, loggerMetadata)
      throw Error(errMsg)
    }
    if (!processedTx) {
      const errMsg = `Stopping pipeline on critical error. Transformer ${transformer.getObjectId()} did ` +
        `not return any data. Input transaction ${JSON.stringify(txData)}`
      logger.error(errMsg, loggerMetadata)
      throw Error(errMsg)
    }
    if (!txDataProcessedFormat) {
      const errMsg = `Stopping pipeline on critical error. Transformer ${transformer.getObjectId()} did ` +
        `did format of its output txData.`
      logger.error(errMsg, loggerMetadata)
      throw Error(errMsg)
    }
    return { processedTx, format: txDataProcessedFormat }
  }

  /*
  Might throw on critical error. Throwing here will lead to stopping worker.
   */
  async function tryConsumeNextTransaction () {
    logger.info(`Cycle '${requestCycleCount}' starts.`, loggerMetadata)
    try {
      logger.info(`Average durations ${JSON.stringify(getAverageDurations(), null, 2)}`, loggerMetadata)
    } catch (e) {
      logger.warn(`Error evaluating average durations. ${e.message} ${e.stack}`, loggerMetadata)
    }

    // get it
    let txData, txMeta
    try {
      logger.info(`Cycle '${requestCycleCount}' requesting next transaction.`, loggerMetadata)
      let res = await getNextTxTimed(subledger, iteratorTxFormat)
      if (!res) {
        timerLock.addBlockTime(timeoutOnTxNoFound, jitterRatio)
        logger.warn(`Cycle '${requestCycleCount}': iterator exhausted.`, loggerMetadata)
        return
      }
      let { tx, meta } = res
      txData = tx
      txMeta = meta
    } catch (e) {
      cycleExceptionCount++
      timerLock.addBlockTime(timeoutOnLedgerResolutionError, jitterRatio)
      logger.error(`Cycle '${requestCycleCount}' failed to resolve next tx. Details: ${e.message} ${e.stack}`, loggerMetadata)
      return
    }

    if (!txMeta || !txMeta.subledger || !txMeta.seqNo || !txMeta.format) {
      const errMsg = `Stopping pipeline on critical error. Iterator did not return sufficient meta information` +
        `about tx. Meta ${JSON.stringify(txMeta)}`
      logger.error(errMsg, loggerMetadata)
      throw Error(errMsg)
    }

    // was available?
    if (!txData) {
      txNotAvailableCount++
      timerLock.addBlockTime(timeoutOnTxNoFound, jitterRatio)
      logger.warn(`Cycle '${requestCycleCount}' was trying to get transaction ${JSON.stringify(txMeta)} but it's not available.`, loggerMetadata)
      return
    }

    // process it
    const { processedTx, format: txDataProcessedFormat } = await processTransaction(txData, txMeta.format)

    try {
      await addTxTimed(txMeta.subledger, txMeta.seqNo, txDataProcessedFormat, processedTx)
      processedTxCount++
      timerLock.addBlockTime(timeoutOnSuccess, jitterRatio)
      logger.info(`Cycle '${requestCycleCount}' processed tx ${JSON.stringify(txMeta)}.`, loggerMetadata)
    } catch (e) {
      cycleExceptionCount++
      timerLock.addBlockTime(timeoutOnTxIngestionError, jitterRatio)
      logger.error(`Cycle '${requestCycleCount}' failed to store tx ${JSON.stringify(txMeta)}. ` +
        `Details: ${e.message} ${e.stack} \n ${util.inspect(e, false, 10)}`, loggerMetadata)
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
        logger.error(`Critical Error. Unhandled error propagated to consumption loop. ${e.message} ${JSON.stringify(e.stack)}. Stopping this consumer.`, loggerMetadata)
        enabled = false
      } finally {
        requestCycleCount++
      }
    }
  }

  async function start () {
    enabled = true
    logger.info(`Worker enabled.`, loggerMetadata)
    while (!initialzed) { // eslint-disable-line
      logger.info(`Waiting for initialization to complete.`, loggerMetadata)
      await sleep(1000)
    }
    logger.info(`Worker starting.`, loggerMetadata)
    consumptionCycle()
  }

  function stop () {
    logger.info(`Stopping worker.`, loggerMetadata)
    enabled = false
  }

  function info () {
    return {
      consumerName: componentId,
      processedTxCount,
      requestCycleCount,
      txNotAvailableCount,
      cycleExceptionCount
    }
  }

  function getObjectId () {
    return componentId
  }

  return {
    getObjectId,
    start,
    stop,
    info
  }
}

module.exports.createWorkerRtw = createWorkerRtw
