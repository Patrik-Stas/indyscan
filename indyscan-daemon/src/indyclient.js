const indy = require('indy-sdk')
const logger = require('./logging/logger-main')

const LEDGER_NAME_TO_CODE = {
  'pool': '0',
  'domain': '1',
  'config': '2'
}

module.exports = async function createClient (poolName, walletName) {
  logger.info(`Creating indy client for pool '${poolName}' with wallet '${walletName}'.`)
  indy.setProtocolVersion(2)

  logger.info(`Connecting to ${poolName}`)
  const poolHandle = await indy.openPoolLedger(poolName)
  logger.info('Connected.')

  logger.info('Assuring local wallet.')
  const config = JSON.stringify({ id: walletName, storage_type: 'default' })
  const credentials = JSON.stringify({ key: 'ke®y' })
  try {
    await indy.createWallet(config, credentials)
    logger.debug(`New wallet '${walletName}' created.`)
  } catch (err) {
    logger.debug(err)
    logger.debug(err.stack)
    logger.debug('Wallet probably already exists, will proceed.')
  }
  const wh = await indy.openWallet(config, credentials)
  logger.debug(`Opened wallet '${walletName}'.`)
  const res = await indy.createAndStoreMyDid(wh, {})
  const did = res[0]
  logger.debug(`Created did/verkey ${JSON.stringify(res)}`)

  /*
  Returns transaction data if transaction was resolved
  Returns null if transaction does not exists on the ledger
  Return null if proper response is not received
  */
  async function getTx (subledgerName, txid) {
    const subledgerCode = LEDGER_NAME_TO_CODE[subledgerName.toLowerCase()]
    const getTx = await indy.buildGetTxnRequest(did, subledgerCode, txid)
    logger.debug(`Built GET_TX request: ${JSON.stringify(getTx)}`)
    const tx = await indy.submitRequest(poolHandle, getTx)
    if (tx.op === 'REPLY') {
      if (tx.result.data) {
        return tx.result.data
      } else {
        return null
      }
    } else {
      throw Error(`We have issues receiving reply from the network.`)
    }
  }

  return {
    getTx
  }
}
