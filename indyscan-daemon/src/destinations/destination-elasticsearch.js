async function createTxResolve (sourceConfig) {
  if (sourceConfig.type === 'ledger') {
    return createTxResolverLedger(sourceConfig.data)
  } else if (sourceConfig.type === 'elasticsearch-readonly') {
    createReadStoragesElasticsearch()
    throw Error(`Invalid network configuration ${JSON.stringify(sourceConfig)}. Only "ledger" source is valid.`)
  }
}

module.exports.createTxResolve = createTxResolve
