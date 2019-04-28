const genesis = require('./genesis-data')
const util = require('./genesis-util')
const fs = require('fs')
const indy = require('indy-sdk')

async function generateGenesisFile (txs, name) {
  const genesisTxFilePath = util.getGenesisTxPathForPool(name)
  console.log(`Looking for genesis file ${genesisTxFilePath}`)
  const exists = await fs.existsSync(genesisTxFilePath)
  if (!exists) {
    await util.createGenesisTxnFile(genesisTxFilePath, txs)
  }
  try {
    await indy.createPoolLedgerConfig(name, {
      'genesis_txn': genesisTxFilePath
    })
  } catch (e) {
    console.log(e)
    console.log(e.stack)
  }
}

generateGenesisFile(genesis.SOVRIN_TESTNET, 'SOVRIN_TESTNET')
generateGenesisFile(genesis.SOVRIN_MAINNET, 'SOVRIN_MAINNET')
generateGenesisFile(genesis.SOVRIN_BUILDERNET, 'SOVRIN_BUILDERNET')
