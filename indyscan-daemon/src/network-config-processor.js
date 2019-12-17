const scanConfigPresets = {
  'SLOW':
    {
      timeoutOnSuccess: 30 * 1000,
      timeoutOnTxIngestionError: 60 * 1000,
      timeoutOnLedgerResolutionError: 60 * 1000,
      timeoutOnTxNoFound: 30 * 1000,
      jitterRatio: 0.1
    },
  'MEDIUM':
    {
      timeoutOnSuccess: 6000,
      timeoutOnTxIngestionError: 60 * 1000,
      timeoutOnLedgerResolutionError: 60 * 1000,
      timeoutOnTxNoFound: 20 * 1000,
      jitterRatio: 0.1
    },
  'INDYSCAN.IO':
    {
      timeoutOnSuccess: 1000,
      timeoutOnTxIngestionError: 60 * 1000,
      timeoutOnLedgerResolutionError: 60 * 1000,
      timeoutOnTxNoFound: 3000,
      jitterRatio: 0.1
    },
  'FAST':
    {
      timeoutOnSuccess: 1000,
      timeoutOnTxIngestionError: 60 * 1000,
      timeoutOnLedgerResolutionError: 60 * 1000,
      timeoutOnTxNoFound: 2000,
      jitterRatio: 0.1
    },
  'TURBO':
    {
      timeoutOnSuccess: 300,
      timeoutOnTxIngestionError: 60 * 1000,
      timeoutOnLedgerResolutionError: 60 * 1000,
      timeoutOnTxNoFound: 2000,
      jitterRatio: 0.1
    },
  'FRENZY':
    {
      timeoutOnSuccess: 300,
      timeoutOnTxIngestionError: 60 * 1000,
      timeoutOnLedgerResolutionError: 60 * 1000,
      timeoutOnTxNoFound: 2000,
      jitterRatio: 0.1
    }
}

function getScanConfig (networkConfig) {
  return (networkConfig.scanning && networkConfig.scanning.mode)
    ? scanConfigPresets[networkConfig.scanning.mode]
    : scanConfigPresets['MEDIUM']
}

function getTargetConfig (networkConfig, globalEsUrl) {
  let finalConfig = Object.assign({}, networkConfig.target)
  if (finalConfig.type === 'elasticsearch') {
    if (finalConfig.data.url === undefined) {
      finalConfig.data.url = globalEsUrl
    }
    if (finalConfig.data.indexReplicaCount === undefined) {
      finalConfig.data.indexReplicaCount = 0
    }
  } else {
    throw Error(`Target config ${networkConfig.target.type} is not currently supported.`)
  }
  return finalConfig
}

function getSourceConfig (networkConfig) {
  let finalConfig = Object.assign({}, networkConfig.source)
  if (finalConfig.type !== 'ledger') {
    throw Error(`Source type '${finalConfig.type}' is not supported. Found in network config ${JSON.stringify(networkConfig)}`)
  }
  if (finalConfig.data.genesis === undefined) {
    throw Error(`Source configuration of 'ledger' type must specify path to genesis file via genesis field`)
  }
  return finalConfig
}

function processConfig (networkConfig, globalEsUrl) {
  const {name} = networkConfig
  const scanConfig = getScanConfig(networkConfig)
  const sourceConfig = getSourceConfig(networkConfig)
  const targetConfig = getTargetConfig(networkConfig, globalEsUrl)
  return {name, scanConfig, sourceConfig, targetConfig}
}

module.exports.processConfig = processConfig
