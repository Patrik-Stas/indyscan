const getNetworks = require('./networks').getNetworks
const getNetwork  = require('./networks').getNetwork
const getDefaultNetwork = require('./networks').getDefaultNetwork
const getTxTimeseries = require('./txs-stats').getTxTimeseries
const getTxCount = require('./txs-stats').getTxCount
// const getHistogram = require('./txs-stats').getHistogram
const getTransactions = require('./txs').getTransactions
const getTx = require('./txs').getTx

module.exports.getNetworks = getNetworks
module.exports.getDefaultNetwork = getDefaultNetwork
module.exports.getTxTimeseries = getTxTimeseries
module.exports.getTxCount = getTxCount
module.exports.getTransactions = getTransactions
// module.exports.getHistogram = getHistogram
module.exports.getTx = getTx
module.exports.getNetwork  = getNetwork
