const INDY_NETWORKS = process.env.INDY_NETWORKS || 'SOVRIN_MAINNET,SOVRIN_TESTNET,LOCALHOST';
const indyNetworks = INDY_NETWORKS.split(',');

exports.getIndyNetworks = function getIndyNetworks() {
    return indyNetworks;
};

exports.getDefaultNetwork = function getDefaultNetwork() {
    return indyNetworks[0];
};