const TYPE_TO_DETAIL = {
  1: { ledger: 'DOMAIN', txName: 'NYM', description: 'The transaction can be used for creation of new DIDs, setting and rotation of verification key, setting and changing of roles.' },
  100: { ledger: 'DOMAIN', txName: 'ATTRIB', description: 'Adds an attribute to a NYM record' },
  101: { ledger: 'DOMAIN', txName: 'SCHEMA', description: 'Adds a Claim\'s schema.' },
  102: { ledger: 'DOMAIN', txName: 'CLAIM_DEF', description: 'Adds a claim definition (in particular, public key), that Issuer creates and publishes for a particular claim schema.' },
  113: { ledger: 'DOMAIN', txName: 'REVOC_REG_DEF', description: 'Adds a Revocation Registry Definition, that Issuer creates and publishes for a particular Claim Definition. It contains public keys, maximum number of credentials the registry may contain, reference to the Claim Def, plus some revocation registry specific data.' },
  114: { ledger: 'DOMAIN', txName: 'REVOC_REG_ENTRY', description: 'The RevocReg entry containing the new accumulator value and issued/revoked indices. This is just a delta of indices, not the whole list. So, it can be sent each time a new claim is issued/revoked.' },
  200: { ledger: 'DOMAIN', txName: 'SET_CONTEXT', description: 'Adds a Context' },
  0: { ledger: 'POOL', txName: 'NODE', description: 'Adds a new node to the pool or updates an existing node in the pool' },
  109: { ledger: 'CONFIG', txName: 'POOL_UPGRADE', description: 'Command to upgrade the Pool (sent by Trustee). It upgrades the specified Nodes (either all nodes in the Pool, or some specific ones).' },
  110: { ledger: 'CONFIG', txName: 'NODE_UPGRADE', description: 'Status of each Node\'s upgrade (sent by each upgraded Node)' },
  111: { ledger: 'CONFIG', txName: 'POOL_CONFIG', description: 'Command to change Pool\'s configuration' },
  120: { ledger: 'CONFIG', txName: 'AUTH_RULE', description: 'A command to change authentication rules.' },
  122: { ledger: 'CONFIG', txName: 'AUTH_RULES', description: 'A command to set multiple AUTH_RULEs by one transaction.' },
  4: { ledger: 'CONFIG', txName: 'TXN_AUTHOR_AGREEMENT', description: 'Setting (enabling/disabling) a transaction author agreement for the pool. If transaction author agreement is set, then all write requests to Domain ledger (transactions) must include additional metadata pointing to the latest transaction author agreement\'s digest which is signed by the transaction author.' },
  5: { ledger: 'CONFIG', txName: 'TXN_AUTHOR_AGREEMENT_AML', description: 'Setting a list of acceptance mechanisms for transaction author agreement. Each write request for which a transaction author agreement needs to be accepted must point to a mechanism from the latest list on the ledger. The chosen mechanism is signed by the write request author (together with the transaction author agreement digest).' }
}

const LEDGER_ID_TO_DETAIL = {
  0: 'POOL',
  1: 'DOMAIN',
  2: 'CONFIG',
  3: 'AUDIT'
}

const LEDGER_NAME_TO_ID = {
  POOL: 0,
  DOMAIN: 1,
  CONFIG: 2,
  AUDIT: 3
}

const TX_TYPES = Object.keys(TYPE_TO_DETAIL)

for (const txType of TX_TYPES) {
  TYPE_TO_DETAIL.txType = txType
}

const NAME_TO_DETAIL = {}
for (const txType of TX_TYPES) {
  const { ledger, txName, description } = TYPE_TO_DETAIL[txType]
  NAME_TO_DETAIL[txName] = { txType, ledger, txName, description }
}

const LEDGER_TX_NAMES = { DOMAIN: [], POOL: [], CONFIG: [] }
for (const txType of TX_TYPES) {
  const { ledger, txName } = TYPE_TO_DETAIL[txType]
  LEDGER_TX_NAMES[ledger].push(txName)
}

module.exports.TYPE_TO_DETAIL = TYPE_TO_DETAIL
module.exports.NAME_TO_DETAIL = NAME_TO_DETAIL
module.exports.LEDGER_TX_NAMES = LEDGER_TX_NAMES
module.exports.LEDGER_ID_TO_DETAIL = LEDGER_ID_TO_DETAIL
module.exports.LEDGER_NAME_TO_ID = LEDGER_NAME_TO_ID
