const { createSourceLedger } = require('../src/sources/source-ledger')
const path = require('path')

const subledger = 'domain'

async function run () {
  const genesisPath = path.join(__dirname, '../app-configs/genesis/SOVRIN_MAINNET.txn')
  const source = await createSourceLedger({ indyNetworkId: 'sovmain', name: 'mainnet', genesisPath })
  const seqNo = parseInt(process.env.SEQNO)
  const tx = await source.getTxData(subledger, seqNo, 'original')
  console.log(JSON.stringify(tx))
}

run()
