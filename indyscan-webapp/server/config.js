// [{db:'SOVRIN_TESTNET', display:'SOVRIN STAGING NET', id: 'sovrin-staging-net', aliases:['SOVRIN_TESTNET']}]

function loadV1Config (configV1) {
  const indyNetworks = configV1.split(',')
  const configs = []
  for (const indyNetwork of indyNetworks) {
    configs.push({ id: indyNetwork, db: indyNetwork, display: indyNetwork })
  }
  return configs
}

function loadV2Config (configV2) {
  return JSON.parse(configV2)
}

module.exports.loadV1Config = loadV1Config
module.exports.loadV2Config = loadV2Config
