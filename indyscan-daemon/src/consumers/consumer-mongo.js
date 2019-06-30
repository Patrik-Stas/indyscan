import { createLedgerStore } from 'indyscan-storage'
const logger = require('./logging/logger-main')
const { subledgers } = require('indyscan-storage')

export async function createConsumerMongo (txEmitter, mongoDatabase, networkName, subledger, timerLock) {
  const consumerName = `${networkName}-${subledger}`
  if (!subledgers[subledger]) {
    throw Error(`Can't recognize subledger '${subledger}'.`)
  }

  async function filterTxs (network, subledger, seqNo, requester, tx) {
    return (requester === consumerName && _desiredSeqNo !== undefined && seqNo === _desiredSeqNo)
  }

  const indyscanMongoClient = await createLedgerStore(mongoDatabase, subledgers[subledger].collection)
  txEmitter.onTxResolved(processTx, filterTxs)
  txEmitter.onTxNotAvailable(delayNextOnNotAvailable, filterTxs)

  let _desiredSeqNo
  async function getDesiredSeqNo () {
    if (_desiredSeqNo === undefined) {
      _desiredSeqNo = (await indyscanMongoClient.findMaxTxIdInDb()) + 1
    }
    return _desiredSeqNo
  }

  async function delayNextOnNotAvailable (network, subledger, seqNo, requester) {
    logger.info(`${consumerName} Tx seqno=${seqNo} does not yet exist.`)
    timerLock.timeoutBlock()
  }

  async function processTx (network, subledger, seqNo, requester, tx) {
    await indyscanMongoClient.addTx(tx)
    _desiredSeqNo++
    logger.info(`${consumerName} >>>>>>> New tx seqno=${seqNo} retrieved and stored`)
  }

  async function keepConsuming () {
    while (true) {
      try {
        await timerLock.waitTillUnlock()
        timerLock.frequencyBlock()
        const seqNo = await getDesiredSeqNo()
        txEmitter.submitTxRequest(networkName, subledger, seqNo, consumerName)
      } catch (error) {
        logger.error(`Consumer [${consumerName}] threw Error out to the consumer cycle:`)
        logger.error(error.stack)
        timerLock.timeoutBlock()
      }
    }
  }

  keepConsuming()
}
