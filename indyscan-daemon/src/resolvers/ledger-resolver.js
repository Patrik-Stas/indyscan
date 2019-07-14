const createIndyClient = require('../indyclient')

async function createTxResolverLedger (networks) {
  let clients = {}

  for (const network of networks) {
    const client = await createIndyClient(network, `sovrinscan-${network}`)
    clients[network] = client
  }

  async function txResolve (network, subledger, seqNo) {
    const client = clients[network]
    if (!client) {
      throw Error(`Can't resolve transaction ${network}/${subledger}/${seqNo} because the network ${network} is not
       recognized by ledger resolver.`)
    }
    return client.getTx(subledger, seqNo)
  }

  return txResolve
}

module.exports.createTxResolverLedger = createTxResolverLedger
