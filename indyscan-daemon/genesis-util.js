const homeDir = require('os').homedir()
const indyDir = `${homeDir}/.indy_client`

module.exports.getGenesisTxPathForPool = function getGenesisTxPathForPool (poolName) {
  return `${indyDir}/pool/${poolName}/${poolName}.txn`
}
