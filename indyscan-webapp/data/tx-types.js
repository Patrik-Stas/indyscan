const txTypes = {
  0: { name: 'NODE', description: 'Adds a new node to the pool, or updates existing node in the pool.' },
  1: { name: 'NYM', description: 'Creates a new NYM record for a specific user, trust anchor, steward or trustee.' },
  100: { name: 'ATTRIB', description: 'Adds attribute to a NYM record.' },
  101: { name: 'SCHEMA', description: 'Adds Claim\'s schema.' },
  102: {
    name: 'CLAIM_DEF',
    description: 'Adds a claim definition (in particular, public key), that Issuer creates and publishes for a particular Claim Schema'
  },
  109: {
    name: 'POOL_UPGRADE',
    description: 'Command to upgrade the Pool (sent by Trustee). It upgrades the specified Nodes (either all nodes in the Pool, or some specific ones).    '
  },
  110: { name: 'NODE_UPGRADE', description: 'Indicates state of upgrading an Indy node to different version.' },
  111: { name: 'POOL_CONFIG', description: 'Command to change Pool\'s configuration' }
}

const ledgerTxTypes = {
  'domain': ['NODE', 'NYM', 'ATTRIB', 'SCHEMA', 'CLAIM_DEF'],
  'pool': ['POOL_UPGRADE', 'NODE_UPGRADE'],
  'config': ['POOL_CONFIG']
}

const NAME_TO_CODE = {
  'NODE': 0,
  'NYM': 1,
  'ATTRIB': 100,
  'SCHEMA': 101,
  'CLAIM_DEF': 102,
  'POOL_UPGRADE': 109,
  'NODE_UPGRADE': 110,
  'POOL_CONFIG': 111
}

function txNameToTxCode (txName) {
  return NAME_TO_CODE[txName]
}

function getDomainTxTypes () {
  return ledgerTxTypes.domain
}

function getPoolTxTypes () {
  return ledgerTxTypes.pool
}

function getConfigTxTypes () {
  return ledgerTxTypes.config
}

function txCodeToTxType (txCode) {
  return txTypes[txCode]['name']
}

function txCodeToTxDescription (txCode) {
  return txTypes[txCode]['description']
}

function genFieldChangeString (fieldObj) {
  const fieldNames = Object.keys(fieldObj)
  let changes = []
  for (let i = 0; i < fieldNames.length; i++) {
    const fieldName = fieldNames[i]
    const value = fieldObj[fieldName]
    if (value) {
      changes.push(`Value of ${fieldName} changed to ${value}.`)
    }
  }
  return changes
}

function describeTransaction (tx) {
  const code = tx.txn.type
  const typeCode = txCodeToTxType(code)
  switch (typeCode) {
    case 'NODE':
      const { alias, blskey, node_ip, client_port, node_port, services } = tx.txn.data.data
      const changeObj = {
        'alias': alias,
        'blskey': blskey,
        'node_ip': node_ip,
        'client_port': client_port,
        'node_port': node_port,
        'services': services
      }
      const changes = genFieldChangeString(changeObj)
      const { dest } = tx.txn.data
      return `Adds or updates node ${dest} with alias ${alias}. Changes: ${changes.join(' ')}`

    case 'NYM':

    case 'ATTRIB':

    case 'SCHEMA':

    case 'CLAIM_DEF':

    case 'POOL_UPGRADE':

    case 'NODE_UPGRADE':

    case 'POOL_CONFIG':
  }
}

module.exports.txNameToTxCode = txNameToTxCode
module.exports.txCodeToTxType = txCodeToTxType
module.exports.txCodeToTxDescription = txCodeToTxDescription
module.exports.genFieldChangeString = genFieldChangeString
module.exports.describeTransaction = describeTransaction
module.exports.getDomainTxTypes = getDomainTxTypes
module.exports.getPoolTxTypes = getPoolTxTypes
module.exports.getConfigTxTypes = getConfigTxTypes
