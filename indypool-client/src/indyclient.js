const vdrtools = require('vdr-tools')
const logger = require('./logging/logger-main')
const fs = require('fs')
const os = require('os')

const LEDGER_NAME_TO_CODE = {
  'pool': '0',
  'domain': '1',
  'config': '2'
}

async function registerLedger (poolName, genesisFilePath) {
  await vdrtools.createPoolLedgerConfig(poolName, { genesis_txn: genesisFilePath })
}

async function getListOfRegisteredLedgers () {
  let pools = await vdrtools.listPools()
  return pools.map(ledger => ledger.pool)
}

async function isUnknownLedger (ledgerName) {
  let ledgers = await getListOfRegisteredLedgers()
  return (ledgers.find(l => l === ledgerName) === undefined)
}

async function isKnownLedger (ledgerName) {
  return !(await isUnknownLedger(ledgerName))
}

async function createIndyClient (ledgerName, genesisPath = undefined) {
  const whoami = `IndyClient[${ledgerName}]`
  await vdrtools.setProtocolVersion(2)

  if (await isUnknownLedger(ledgerName)) {
    if (!genesisPath) {
      throw Error(`Ledger ${ledgerName} is is not known (ie. not located in ~/.indy_client/pools)` +
      ` and because neither genesis file for this ledger was supplied, it cannot be added.` +
      ` Currently known pools are: ${JSON.stringify(await getListOfRegisteredLedgers())}`)
    }
    logger.warn(`Ledger ${ledgerName} is being registered using genesis file: ${genesisPath}`)
    await registerLedger(ledgerName, genesisPath)
  }
  let genesisData = fs.readFileSync(`${os.homedir()}/.indy_client/pool/${ledgerName}/${ledgerName}.txn`)
  logger.info(`${whoami} Using genesis: ${genesisData}`)
  logger.info(`${whoami} Connecting to ledger ${ledgerName}.`)
  const poolHandle = await vdrtools.openPoolLedger(ledgerName)
  logger.info(`${whoami} Connected to ledger ${ledgerName}.`)

  const walletName = `indyscan-${ledgerName}`
  logger.info(`${whoami} Assuring local wallet.`)
  const config = JSON.stringify({ id: walletName, storage_type: 'default' })
  const credentials = JSON.stringify({ key: 'ke®y' })
  try {
    await vdrtools.createWallet(config, credentials)
    logger.debug(`New wallet '${walletName}' created.`)
  } catch (err) {
    if (err.message !== 'WalletAlreadyExistsError') {
      logger.error(`Unexpected error trying to create a wallet: ${err.message} ${JSON.stringify(err.stack)}`)
    }
  }
  const wh = await vdrtools.openWallet(config, credentials)
  logger.debug(`${whoami} Opened wallet '${walletName}'.`)
  const res = await vdrtools.createAndStoreMyDid(wh, {})
  const did = res[0]
  logger.debug(`${whoami} Created did/verkey ${JSON.stringify(res)}`)

  /*
  Returns transaction data if transaction was resolved
  Returns null if transaction does not exists on the ledger
  Return null if proper response is not received
  */
  async function getTx (subledgerName, seqNo) {
    const subledgerCode = LEDGER_NAME_TO_CODE[subledgerName.toLowerCase()]
    const getTx = await vdrtools.buildGetTxnRequest(did, subledgerCode, seqNo)
    logger.debug(`${whoami} Built GET_TX request: ${JSON.stringify(getTx)}`)
    const tx = await vdrtools.submitRequest(poolHandle, getTx)
    if (tx.op === 'REPLY') {
      if (tx.result.data) {
        return tx.result.data
      } else {
        return null
      }
    } else {
      throw Error(`${whoami} Problem receiving tx seqNo='${seqNo}' for subledger='${subledgerName}'`)
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
