const { createTimerLock } = require('../scan-timer')

const logger = require('../logging/logger-main')

function createConsumerSequential (txEmitter, indyscanStorage, network, subledger, timerConfig, name = null) {
  const consumerName = name || `${network}-${subledger}`
  const { periodMs, unavailableTimeoutMs, jitterRatio } = timerConfig

  let processedTxCount = 0
  let requestCycleCount = 0
  let txNotAvailableCount = 0
  let cycleExceptionCount = 0

  let enabled = true

  const timerLock = createTimerLock()

  async function filterTxs (txNetwork, txNubledger, txSeqNo, txRequester, tx) {
    const shouldBeProcessed = (
      network === txNetwork &&
      subledger === txNubledger &&
      _desiredSeqNo === txSeqNo
    )
    if (!shouldBeProcessed) {
      logger.warn(`${consumerName} (desiredSeqNo=${_desiredSeqNo}) will filter transaction. (txNetwork=${txNetwork}, txNubledger=${txNubledger}, txSeqN=${txSeqNo}, txRequester=${txRequester})`)
    }
    return shouldBeProcessed
  }

  txEmitter.onTxResolved(processTx, filterTxs)
  txEmitter.onTxNotAvailable(delayNextOnNotAvailable, filterTxs)

  let _desiredSeqNo
  async function getDesiredSeqNo () {
    if (_desiredSeqNo === undefined) {
      _desiredSeqNo = (await indyscanStorage.findMaxSeqNo()) + 1
    }
    return _desiredSeqNo
  }

  async function delayNextOnNotAvailable (network, subledger, seqNo, requester) {
    logger.info(`${consumerName} Tx seqno=${seqNo} does not yet exist.`)
    txNotAvailableCount++
    timerLock.addBlockTime(unavailableTimeoutMs, jitterRatio)
  }

  async function processTx (network, subledger, seqNo, requester, tx) {
    await indyscanStorage.addTx(tx)
    _desiredSeqNo++
    processedTxCount++
    logger.info(`${consumerName} >>>>>>> New tx seqno=${seqNo} retrieved and stored`)
  }

  async function consumptionCycle () {
    while (true) {
      try {
        logger.info(`Consumer [${consumerName}]: Starting new consumption cycle '${requestCycleCount}'.`)
        if (!enabled) {
          logger.info(`Consumer [${consumerName}]: Disabled, breaking consumption cycle.`)
          break
        }
        logger.info(`Consumer [${consumerName}]: Waiting at the start of cycle, roughly '${timerLock.getMsTillUnlock()}' miliseconds.`)
        await timerLock.waitTillUnlock()
        timerLock.addBlockTime(periodMs, jitterRatio)
        const seqNo = await getDesiredSeqNo()
        logger.info(`Consumer [${consumerName}]: Going to request tx network='${network}' subledger}='${subledger}' seqNo='${seqNo}' as '${consumerName}'.`)
        txEmitter.submitTxRequest(network, subledger, seqNo, consumerName)
        logger.info(`Consumer [${consumerName}]: Finished cycle '${requestCycleCount}'.`)
        requestCycleCount++
      } catch (error) {
        cycleExceptionCount++
        logger.error(`Consumer [${consumerName}] threw Error out to the consumer cycle '${requestCycleCount}'.`)
        logger.error(error.stack)
        timerLock.addBlockTime(unavailableTimeoutMs, jitterRatio)
      }
    }
  }

  function info () {
    return {
      consumerName,
      desiredSeqNo: _desiredSeqNo,
      processedTxCount,
      requestCycleCount,
      txNotAvailableCount,
      cycleExceptionCount
    }
  }

  function start () {
    logger.info(`${consumerName}: Starting`)
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
