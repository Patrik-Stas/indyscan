const { rightPad } = require('../logging/logutil')

const { createTimerLock } = require('../time/scan-timer')

const logger = require('../logging/logger-main')

function createConsumerSequential (txEmitter, indyscanStorage, network, subledger, timerConfig) {
  const logPrefix = `ConsumerSequential/${network}/${subledger} : `
  const { periodMs, unavailableTimeoutMs, jitterRatio } = timerConfig

  let processedTxCount = 0
  let requestCycleCount = 0
  let txNotAvailableCount = 0
  let cycleExceptionCount = 0

  let enabled = true

  const timerLock = createTimerLock()

  async function filterTxs (txRequestId, txNetwork, txSubledger, txSeqNo, txRequester, tx) {
    const shouldBeProcessed = (
      network === txNetwork &&
      subledger === txSubledger &&
      _desiredSeqNo === txSeqNo
    )
    if (!shouldBeProcessed) {
      logger.debug(`${logPrefix} Filtering transaction request result: requestId='${txRequestId}' txNetwork='${txNetwork}' txNubledger='${txSubledger}' txSeqN=${txSeqNo}, txRequester='${txRequester}')`)
    }
    return shouldBeProcessed
  }

  txEmitter.onTxResolved(processTx, filterTxs)
  txEmitter.onTxNotAvailable(delayNextOnNotAvailable, filterTxs)
  txEmitter.onResolutionError(delayNextOnFailedResolution, filterTxs)

  let _desiredSeqNo
  async function getDesiredSeqNo () {
    if (_desiredSeqNo === undefined) {
      _desiredSeqNo = (await indyscanStorage.findMaxSeqNo()) + 1
    }
    return _desiredSeqNo
  }

  async function delayNextOnNotAvailable (requestId, network, subledger, seqNo, requester) {
    logger.info(`${logPrefix} Tx seqno=${seqNo} does not yet exist.`)
    txNotAvailableCount++
    timerLock.addBlockTime(unavailableTimeoutMs, jitterRatio)
  }

  async function delayNextOnFailedResolution (requestId, network, subledger, seqNo, requester) {
    logger.error(`${logPrefix} Tx seqno=${seqNo} failed to resolve.`)
    timerLock.addBlockTime(unavailableTimeoutMs, jitterRatio)
  }

  async function processTx (requestId, network, subledger, seqNo, requester, tx) {
    await indyscanStorage.addTx(tx)
    _desiredSeqNo++
    processedTxCount++
    logger.info(rightPad(`${logPrefix} processed new tx. `, 70, ' ') + `Details: network='${network}' subledger='${subledger}' seqNo='${seqNo}' requester='${requester}'.`)
    logger.debug(`${JSON.stringify(tx)}`)
  }

  async function consumptionCycle () {
    while (true) {
      try {
        logger.debug(`${logPrefix} Cycle '${requestCycleCount}' starts.`)
        if (!enabled) {
          logger.warn(`${logPrefix} Cycle '${requestCycleCount}' discovered consumer was disabled. Terminating cycle now.`)
          break
        }
        logger.debug(`${logPrefix} Cycle '${requestCycleCount}' will wait '${timerLock.getMsTillUnlock()}' ms before it requests tx.`)
        await timerLock.waitTillUnlock()
        timerLock.addBlockTime(periodMs, jitterRatio)
        let seqNo
        try {
          seqNo = await getDesiredSeqNo()
        } catch (err) {
          cycleExceptionCount++
          timerLock.addBlockTime(unavailableTimeoutMs, jitterRatio)
          logger.error(`${logPrefix} Cycle '${requestCycleCount}' thrown error while determining next desired seqNo. Details: ${err.message} ${err.stack}`)
          continue
        }
        logger.info(`${logPrefix}  Cycle '${requestCycleCount}' submitting tx request network='${network}' subledger='${subledger}' seqNo='${seqNo}'.`)
        try {
          txEmitter.submitTxRequest(network, subledger, seqNo, logPrefix)
        } catch (err) {
          cycleExceptionCount++
          timerLock.addBlockTime(unavailableTimeoutMs, jitterRatio)
          logger.error(`${logPrefix} Cycle '${requestCycleCount}' thrown error submitting tx request for seqNo ${seqNo}. Details: ${err.message} ${err.stack}`)
          continue
        }
        logger.debug(`${logPrefix} Cycle '${requestCycleCount}' finished.`)
        requestCycleCount++
      } catch (err) {
        cycleExceptionCount++
        timerLock.addBlockTime(unavailableTimeoutMs, jitterRatio)
        logger.error(`${logPrefix} Cycle '${requestCycleCount}' thrown error unexpected error. Details: ${err.message} ${err.stack}`)
      }
    }
  }

  function info () {
    return {
      consumerName: logPrefix,
      desiredSeqNo: _desiredSeqNo,
      processedTxCount,
      requestCycleCount,
      txNotAvailableCount,
      cycleExceptionCount
    }
  }

  function start () {
    logger.info(`${logPrefix}: Starting`)
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
