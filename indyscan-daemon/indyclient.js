const indy = require('indy-sdk')
const logger = require('./logging/logger-main')

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

  async function getTx (txid, numericLedgerCode) {
    const getTx = await indy.buildGetTxnRequest(did, numericLedgerCode, txid)
    const tx = await indy.submitRequest(poolHandle, getTx)
    if (tx.op === 'REPLY') {
      return tx.result.data
    } else {
      throw Error(`We have issues receiving reply from the network.`)
    }
  }

  return {
    getTx
  }
}
