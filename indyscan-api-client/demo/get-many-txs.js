const { getTxsV2 } = require('../src')

const API_URL = process.env.API_URL || 'https://indyscan.io'
const NETWORK_ID = process.env.NETWORK_ID || 'SOVRIN_TESTNET'

async function fetch_1000txs_in_39K_40K_seqNo_range () { // eslint-disable-line
  return getTxsV2(
    API_URL,
    NETWORK_ID,
    'domain',
    0,
    1000,
    [],
    39000,
    40000,
    'expansion',
    undefined)
}

fetch_1000txs_in_39K_40K_seqNo_range() // eslint-disable-line
  .then(txs => {
    const seqNos = txs.map(tx => tx.imeta.seqNo)
    console.log(`Returned ${seqNos.length} txs.`)
    console.log(`Fetched transaction sequence numbers: ${JSON.stringify(seqNos)}`)
  })
