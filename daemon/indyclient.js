const indy = require('indy-sdk')

module.exports = async function createClient (poolName, walletName) {
  indy.setProtocolVersion(2)

  console.log(`Connecting to ${poolName}`)
  const poolHandle = await indy.openPoolLedger(poolName)
  console.log('Connected.')

  console.log('Assuring local wallet.')
  const config = JSON.stringify({ id: walletName, storage_type: 'default' })
  const credentials = JSON.stringify({ key: 'ke®y' })
  try {
    await indy.createWallet(config, credentials)
    console.log(`New wallet '${walletName}' created.`)
  } catch (err) {
    console.warn(err)
    console.warn(err.stack)
    console.warn('Wallet probably already exists, will proceed.')
  }
  const wh = await indy.openWallet(config, credentials)
  console.log(`Wallet '${walletName}' has been opened.`)
  const res = await indy.createAndStoreMyDid(wh, {})
  const did = res[0]
  const vkey = res[1]
  console.log(`Created new did/verkey ${JSON.stringify(res)}`)

  async function getTx (txid, ledgerType) {
    const getTx = await indy.buildGetTxnRequest(did, ledgerType, txid)
    // console.log(`GetTx request:\n ${txid}: ${JSON.stringify(getTx, null, 2)}`)
    const tx = await indy.submitRequest(poolHandle, getTx)
    console.log(`Retrieved tx:\n ${txid}: ${JSON.stringify(tx)}`)
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
