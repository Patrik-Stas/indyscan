const txTypes = {
    0: 'NODE',
    1: 'NYM',
    100: 'ATTRIB',
    101: 'SCHEMA',
    102: 'CLAIM_DEF',
    109: 'POOL_UPGRADE',
    110: 'NODE_UPGRADE',
    111: 'POOL_CONFIG'
};

export function txCodeToTxType(txCode) {
    return txTypes[txCode]
}
