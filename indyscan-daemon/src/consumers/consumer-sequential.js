const { createTimerLock } = require('../scan-timer')

const logger = require('../logging/logger-main')

function createConsumerSequential (txEmitter, indyscanStorage, networkName, subledger, timerConfig) {
  const consumerName = `consumer-${networkName}-${subledger}`
  const { periodMs, unavailableTimeoutMs, jitterRatio } = timerConfig

  let processedTxCount = 0
  let requestCycleCount = 0
  let txNotAvailableCount = 0
  let cycleExceptionCount = 0

  const timerLock = createTimerLock()

  async function filterTxs (network, subledger, seqNo, requester, tx) {
    return (requester === consumerName && _desiredSeqNo !== undefined && seqNo === _desiredSeqNo)
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
        await timerLock.waitTillUnlock()
        timerLock.addBlockTime(periodMs, jitterRatio)
        const seqNo = await getDesiredSeqNo()
        txEmitter.submitTxRequest(networkName, subledger, seqNo, consumerName)
        requestCycleCount++
      } catch (error) {
        cycleExceptionCount++
        logger.error(`Consumer [${consumerName}] threw Error out to the consumer cycle:`)
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

  return {
    start,
    info
  }
}

module.exports.createConsumerSequential = createConsumerSequential
