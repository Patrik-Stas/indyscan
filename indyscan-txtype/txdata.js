module.exports.TX_DETAILS = {
  0: {name: 'NODE', description: 'Adds a new node to the pool, or updates existing node in the pool.'},
  1: {name: 'NYM', description: 'Creates a new NYM record for a specific user, trust anchor, steward or trustee.'},
  100: {name: 'ATTRIB', description: 'Adds attribute to a NYM record.'},
  101: {name: 'SCHEMA', description: 'Adds Claim\'s schema.'},
  102: {
    name: 'CLAIM_DEF',
    description: 'Adds a claim definition (in particular, public key), that Issuer creates and publishes for a particular Claim Schema'
  },
  109: {
    name: 'POOL_UPGRADE',
    description: 'Command to upgrade the Pool (sent by Trustee). It upgrades the specified Nodes (either all nodes in the Pool, or some specific ones).    '
  },
  110: {name: 'NODE_UPGRADE', description: 'Indicates state of upgrading an Indy node to different version.'},
  111: {name: 'POOL_CONFIG', description: 'Command to change Pool\'s configuration'},
  20000: {name: 'UNKNOWN_FEES_TX', description: 'TODO: Find out what this is.' }
}

module.exports.LEDGER_TX_NAMES = {
  'domain': ['NYM', 'ATTRIB', 'SCHEMA', 'CLAIM_DEF', 'REVOC_REG_DEF', 'REVOC_REG_ENTRY', 'TXN_AUTHOR_AGREEMENT', 'TXN_AUTHOR_AGREEMENT_AML'],
  'pool': ['NODE'],
  'config': ['NODE_UPGRADE', 'POOL_UPGRADE', 'POOL_CONFIG', 'AUTH_RULE']
}

module.exports.TYPE_TO_NAME = {
  '0': 'NODE',
  '1': 'NYM',
  '4': 'TXN_AUTHOR_AGREEMENT',
  '5': 'TXN_AUTHOR_AGREEMENT_AML',
  '100': 'ATTRIB',
  '101': 'SCHEMA',
  '102': 'CLAIM_DEF',
  '109': 'POOL_UPGRADE',
  '110': 'NODE_UPGRADE',
  '111': 'POOL_CONFIG',
  '113': 'REVOC_REG_DEF',
  '114': 'REVOC_REG_ENTRY',
  '120': 'AUTH_RULE',
  '122': 'AUTH_RULES',
  '20000': 'UNKNOWN_FEES_TX',
}

module.exports.NAME_TO_TYPE = {
  'NODE': '0',
  'NYM': '1',
  'TXN_AUTHOR_AGREEMENT':'4',
  'TXN_AUTHOR_AGREEMENT_AML':'5',
  'ATTRIB': '100',
  'SCHEMA': '101',
  'CLAIM_DEF': '102',
  'POOL_UPGRADE': '109',
  'NODE_UPGRADE': '110',
  'POOL_CONFIG': '111',
  'REVOC_REG_DEF': '113',
  'REVOC_REG_ENTRY': '114',
  'AUTH_RULE': '120',
  'AUTH_RULES': '122',
  'UNKNOWN_FEES_TX': '20000'
}
