const { createTimerLock } = require('../time/scan-timer')
const util = require('util')
const { getDefaultPreset } = require('../config/presets-consumer')
const { resolvePreset } = require('../config/presets-consumer')
const { runWithTimer } = require('../time/util')
const sleep = require('sleep-promise')
const EventEmitter = require('events')
const { createLogger } = require('../logging/logger-builder')
const { envConfig } = require('../config/env')

function getExpandedTimingConfig (providedTimingSetup) {
  let presetData
  if (!providedTimingSetup) {
    presetData = getDefaultPreset()
  } else if (typeof providedTimingSetup === 'string') {
    presetData = resolvePreset(providedTimingSetup) || getDefaultPreset()
  } else if (typeof providedTimingSetup === 'object') {
    const defaultPreset = getDefaultPreset()
    presetData = { ... defaultPreset, ... providedTimingSetup }
  }
  return presetData
}

function validateTimingConfig (timingConfig) {
  const { timeoutOnSuccess, timeoutOnTxIngestionError, timeoutOnLedgerResolutionError, timeoutOnTxNoFound, jitterRatio } = timingConfig
  if (timeoutOnSuccess === undefined) {
    throw Error('Timing config is missing \'timeoutOnSuccess\'.')
  }
  if (timeoutOnTxIngestionError === undefined) {
    throw Error('Timing config is missing \'timeoutOnTxIngestionError\'.')
  }
  if (timeoutOnLedgerResolutionError === undefined) {
    throw Error('Timing config is missing \'timeoutOnLedgerResolutionError\'.')
  }
  if (timeoutOnTxNoFound === undefined) {
    throw Error('Timing config is missing \'timeoutOnTxNoFound\'.')
  }
  if (jitterRatio === undefined) {
    throw Error('Timing config is missing \'jitterRatio\'.')
  }
}

async function createWorkerRtw ({ indyNetworkId, subledger, operationType, iterator, iteratorTxFormat, transformer, target, timing }) {
  const workerId = `${indyNetworkId}.${subledger}.${operationType}`
  const logger = createLogger(workerId, envConfig.LOG_LEVEL, envConfig.ENABLE_LOGFILES)
  logger.info(`Building RTW worker ${workerId} for network: ${indyNetworkId}`)
  const eventEmitter = new EventEmitter()
  const loggerMetadata = {
    metadaemon: {
      workerId,
      indyNetworkId,
      operationType
    }
  }

  if (!workerId) {
    const errMsg = 'WorkerRTW missing id parameter.'
    logger.error(errMsg, loggerMetadata)
    throw Error(errMsg)
  }
  if (!subledger) {
    const errMsg = 'WorkerRTW missing subledger parameter.'
    logger.error(errMsg, loggerMetadata)
    throw Error(errMsg)
  }
  if (!iterator) {
    const errMsg = 'WorkerRTW missing iterator parameter.'
    logger.error(errMsg, loggerMetadata)
    throw Error(errMsg)
  }
  if (!iteratorTxFormat) {
    const errMsg = 'WorkerRTW missing iteratorTxFormat parameter.'
    logger.error(errMsg, loggerMetadata)
    throw Error(errMsg)
  }
  if (!transformer) {
    const errMsg = 'WorkerRTW missing transformer parameter.'
    logger.error(errMsg, loggerMetadata)
    throw Error(errMsg)
  }
  if (!target) {
    const errMsg = 'WorkerRTW missing target parameter.'
    logger.error(errMsg, loggerMetadata)
    throw Error(errMsg)
  }
  timing = getExpandedTimingConfig(timing)
  logger.info(`Effective timing configuration ${JSON.stringify(timing, null, 2)}`)
  validateTimingConfig(timing)
  const { timeoutOnSuccess, timeoutOnTxIngestionError, timeoutOnLedgerResolutionError, timeoutOnTxNoFound, jitterRatio } = timing

  let initialized = false

  async function initialize () {
    await transformer.initializeTarget(target, logger)
    initialized = true
  }

  await initialize()

  let processedTxCount = 0
  let requestCycleCount = 0
  let txNotAvailableCount = 0
  let cycleExceptionCount = 0

  const timerLock = createTimerLock()

  let enabled = false

  const processesDuration = {}

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
    const sum = list.reduce((a, b) => a + b, 0)
    return sum / list.length || 0
  }

  function getAverageDurations () {
    const avgDurations = {}
    for (const [processName, durations] of Object.entries(processesDuration)) {
      avgDurations[processName] = getAverage(durations)
    }
    return avgDurations
  }

  function eventSharedPayload () {
    return {
      workerId,
      indyNetworkId,
      subledger,
      operationType
    }
  }

  function requestRescheduleStatus () {
    const workerData = eventSharedPayload()
    const payload = { workerData, msTillRescan: timerLock.getMsTillUnlock() }
    return payload
  }

  function txProcessed (txMeta, txDataAfter) {
    processedTxCount++
    timerLock.addBlockTime(timeoutOnSuccess, jitterRatio)
    const workerData = eventSharedPayload()
    const txData = {
      idata: txDataAfter,
      imeta: {
        seqNo: txMeta.seqNo,
        subledger
      }
    }
    logger.info(`Transaction seqno=${txMeta.seqNo} processed. Emitting 'tx-processed', 'rescan-scheduled'`)
    eventEmitter.emit('tx-processed', { workerData, txData })
    eventEmitter.emit('rescan-scheduled', { workerData, msTillRescan: timerLock.getMsTillUnlock() })
  }

  // TODO: in all of this even-reacting functions, rename txMeta or reduce signature requirmenets to require just "seqNo" if possible
  function txNotAvailable (queryMeta) {
    txNotAvailableCount++
    timerLock.addBlockTime(timeoutOnTxNoFound, jitterRatio)
    const workerData = eventSharedPayload()
    logger.info(`Transaction seqno=${queryMeta.seqNo} not available. Emitting 'tx-not-available', 'rescan-scheduled'`)
    eventEmitter.emit('tx-not-available', { workerInfo: getWorkerInfo() })
    eventEmitter.emit('rescan-scheduled', { workerData, msTillRescan: timerLock.getMsTillUnlock() })
  }

  function resolutionError (queryMeta, error) {
    cycleExceptionCount++
    timerLock.addBlockTime(timeoutOnLedgerResolutionError, jitterRatio)
    const workerData = eventSharedPayload()
    logger.warn(`Transaction seqno=${queryMeta.seqNo} resolution error ${util.inspect(error)}. ` +
      'Emitting \'tx-resolution-error\', \'rescan-scheduled\'')
    eventEmitter.emit('tx-resolution-error', getWorkerInfo())
    eventEmitter.emit('rescan-scheduled', { workerData, msTillRescan: timerLock.getMsTillUnlock() })
  }

  function ingestionError (error, queryMeta, processedTx) {
    cycleExceptionCount++
    timerLock.addBlockTime(timeoutOnTxIngestionError, jitterRatio)
    const workerData = eventSharedPayload()
    logger.error(`Transaction ${queryMeta.seqNo} ingestion error. Couldn't ingest transaction` +
      `${JSON.stringify(processedTx)} due to storage ingestion error ${util.inspect(error)} ` +
      'Emitting: \'tx-ingestion-error\', \'rescan-scheduled\'.')
    eventEmitter.emit('tx-ingestion-error', getWorkerInfo())
    eventEmitter.emit('rescan-scheduled', { workerData, msTillRescan: timerLock.getMsTillUnlock() })
  }

  async function processTransaction (txData, txFormat) {
    let processedTx = txData
    let processedTxFormat = txFormat
    try {
      const result = await transformer.processTx(processedTx)
      processedTx = result.processedTx
      processedTxFormat = result.format
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
    if (!processedTxFormat) {
      const errMsg = `Stopping pipeline on critical error. Transformer ${transformer.getObjectId()} did ` +
        'did format of its output txData.'
      logger.error(errMsg, loggerMetadata)
      throw Error(errMsg)
    }
    return { processedTx, processedTxFormat }
  }

  function printAverageDurations () {
    try {
      logger.info(`Average durations ${JSON.stringify(getAverageDurations(), null, 2)}`, loggerMetadata)
    } catch (e) {
      logger.warn(`Error evaluating average durations. ${e.message} ${e.stack}`, loggerMetadata)
    }
  }

  /*
  Might throw on critical error. Throwing here will lead to stopping worker.
   */
  async function tryConsumeNextTransaction () {
    logger.info(`Cycle '${requestCycleCount}' starts.`, loggerMetadata)
    printAverageDurations()

    // get it
    let txDataBefore
    logger.info(`Cycle '${requestCycleCount}' requesting next transaction.`, loggerMetadata)
    const iteratorRes = await getNextTxTimed(subledger, iteratorTxFormat)
    const { queryMeta, queryStatus } = iteratorRes
    if (!queryMeta) { throw Error('Iterator returned invalid response. \'queryMeta\' missing in response. ') }
    if (!queryStatus) { throw Error('Iterator returned invalid response. \'queryStatus\' missing in response. ') }
    switch (queryStatus) {
      case 'CANT_DETERMINE_SEQNO_TO_QUERY':
        return resolutionError(queryMeta, iteratorRes.error)
      case 'CURRENTLY_EXHAUSTED':
        return txNotAvailable(queryMeta)
      case 'RESOLUTION_ERROR':
        return resolutionError(queryMeta, iteratorRes.error)
      case 'RESOLUTION_SUCCESS':
        if (!queryMeta || !queryMeta.subledger || !queryMeta.seqNo || !queryMeta.format) {
          const errMsg = 'Stopping pipeline on critical error. Iterator did not return sufficient meta information' +
            `about tx. Meta ${JSON.stringify(queryMeta)}`
          logger.error(errMsg, loggerMetadata)
          throw Error(errMsg)
        }
        if (!iteratorRes.tx) {
          throw Error('Iterator returned invalid response. Status was RESOLUTION_SUCCESS but did not include transaction data.')
        }
        txDataBefore = iteratorRes.tx
        break
      default:
        throw Error(`Iterator returned unrecognized status '${queryStatus}'.`)
    }

    // process it
    const { processedTx: txDataAfter, processedTxFormat } = await processTransaction(txDataBefore, queryMeta.format)

    // store it and schedule next iteration
    try {
      await addTxTimed(queryMeta.subledger, queryMeta.seqNo, processedTxFormat, txDataAfter)
      txProcessed(queryMeta, txDataAfter)
    } catch (error) {
      ingestionError(error, queryMeta, txDataAfter)
    }
  }

  async function getNextTxTimed (subledger, format) {
    return runWithTimer(
      async () => iterator.getNextTx(subledger, format, logger),
      (duration) => processDurationResult('tx-resolution', duration)
    )
  }

  async function addTxTimed (subledger, seqNo, format, txData) {
    return runWithTimer(
      async () => target.addTxData(subledger, seqNo, format, txData, logger),
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
      requestCycleCount++
      try {
        eventEmitter.emit('cycle-starts', getWorkerInfo())
        await runWithTimer(
          tryConsumeNextTransactionAndWait,
          (duration) => processDurationResult('consumption-iteration-full', duration)
        )
      } catch (e) {
        logger.error(`Critical Error. Unhandled error propagated to consumption loop. ${e.message} ${JSON.stringify(e.stack)}. Stopping this consumer.`, loggerMetadata)
        enabled = false
      }
    }
  }

  async function enable () {
    enabled = true
    logger.info('Worker enabled.', loggerMetadata)
    while (!initialized) { // eslint-disable-line
      logger.info('Waiting for initialization to complete.', loggerMetadata)
      await sleep(1000)
    }
    logger.info('Worker starting.', loggerMetadata)
    consumptionCycle()
  }

  function disable () {
    logger.info('Stopping worker.', loggerMetadata)
    enabled = false
  }

  function flipState () {
    if (enabled) {
      disable()
    } else {
      enable()
    }
  }

  function getWorkerInfo () {
    return {
      initialized,
      enabled,
      workerId,
      indyNetworkId,
      subledger,
      operationType,
      transformerInfo: transformer.describe(),
      iteratorDescription: iterator.describe(),
      iteratorInfo: iterator.getIteratorInfo(),
      targetDescription: target.describe(),
      targetInfo: target.getTargetInfo(),
      stats: {
        processedTxCount,
        requestCycleCount,
        txNotAvailableCount,
        cycleExceptionCount,
        avgDurations: getAverageDurations()
      }
    }
  }

  function getEventEmitter () {
    return eventEmitter
  }

  function getObjectId () {
    return workerId
  }

  return {
    requestRescheduleStatus,
    getWorkerInfo,
    getEventEmitter,
    getObjectId,
    enable,
    disable,
    flipState
  }
}

module.exports = {
  createWorkerRtw,
  getExpandedTimingConfig
}
