const indy = require('vdr-tools')
const logger = require('../logging/logger-main')
const fs = require('fs')

const LEDGER_NAME_TO_CODE = {
  pool: '0',
  domain: '1',
  config: '2'
}

async function registerLedger (ledgerName, genesisFilePath) {
  if (!fs.lstatSync(genesisFilePath).isFile()) {
    throw Error(`Was about to register ledger ${ledgerName} but provided genesis file path ${genesisFilePath}` +
      'does not point to a file.')
  }
  await indy.createPoolLedgerConfig(ledgerName, { genesis_txn: genesisFilePath })
}

async function getListOfRegisteredLedgers () {
  const pools = await indy.listPools()
  return pools.map(ledger => ledger.pool)
}

async function isUnknownLedger (ledgerName) {
  const ledgers = await getListOfRegisteredLedgers()
  return (ledgers.find(l => l === ledgerName) === undefined)
}

async function isKnownLedger (ledgerName) {
  return !(await isUnknownLedger(ledgerName))
}

async function createIndyClient (indyNetworkId, ledgerName, genesisPath = undefined) {
  const loggerMetadata = {
    metadaemon: {
      indyNetworkId,
      componentType: 'indy-client'
    }
  }

  await indy.setProtocolVersion(2)

  if (await isUnknownLedger(ledgerName)) {
    if (!genesisPath) {
      throw Error(`Ledger ${ledgerName} is is not known (ie. not located in ~/.indy_client/pools)` +
      ' and because neither genesis file for this ledger was supplied, it cannot be added.' +
      ` Currently known pools are: ${JSON.stringify(await getListOfRegisteredLedgers())}`)
    }
    logger.warn(`Ledger ${ledgerName} is being registered using genesis file: ${genesisPath}.`, loggerMetadata)
    await registerLedger(ledgerName, genesisPath)
  }
  logger.info(`Connecting to ledger ${ledgerName}.`, loggerMetadata)
  const poolHandle = await indy.openPoolLedger(ledgerName)
  logger.info(`Connected to ledger ${ledgerName}.`, loggerMetadata)

  const walletName = `indyscan-${ledgerName}`
  logger.info('Assuring local wallet.', loggerMetadata)
  const config = JSON.stringify({ id: walletName, storage_type: 'default' })
  const credentials = JSON.stringify({ key: 'ke®y' })
  try {
    await indy.createWallet(config, credentials)
    logger.debug(`New wallet '${walletName}' created.`, loggerMetadata)
  } catch (err) {
    if (err.message !== 'WalletAlreadyExistsError') {
      logger.error(`Unexpected error trying to create a wallet: ${err.message} ${JSON.stringify(err.stack)}`, loggerMetadata)
    }
  }
  const wh = await indy.openWallet(config, credentials)
  logger.debug(`Opened wallet '${walletName}'.`, loggerMetadata)
  const [did] = await indy.createAndStoreMyDid(wh, {})

  /*
  Returns transaction data if transaction was resolved
  Returns null if transaction does not exists on the ledger
  Return null if proper response is not received
  */
  async function getTx (subledgerName, seqNo) {
    const subledgerCode = LEDGER_NAME_TO_CODE[subledgerName.toLowerCase()]
    const getTx = await indy.buildGetTxnRequest(did, subledgerCode, seqNo)
    logger.debug(`Built GET_TX request: ${JSON.stringify(getTx)}`)
    const tx = await indy.submitRequest(poolHandle, getTx)
    if (tx.op === 'REPLY') {
      if (tx.result.data) {
        return tx.result.data
      } else {
        return null
      }
    } else {
      throw Error(`Problem receiving tx seqNo='${seqNo}' for subledger='${subledgerName}'`)
    }
  }

  return {
    getTx
  }
}

module.exports.createIndyClient = createIndyClient
module.exports.isUnknownLedger = isUnknownLedger
module.exports.isKnownLedger = isKnownLedger
module.exports.registerLedger = registerLedger
