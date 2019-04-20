const writeFile = require('write')
const homeDir = require('os').homedir()
const indyDir = `${homeDir}/.indy_client`

module.exports.getGenesisTxPathForPool = function getGenesisTxPathForPool (poolName) {
  return `${indyDir}/pool/${poolName}/${poolName}.txn`
}

module.exports.createGenesisTxnFile = async function createGenesisTxnFile (filename, txs) {
  await writeFile(filename, txs.map(t => JSON.stringify(t)).join('\n'))
  console.log(`Pool genesis file ${filename} withh ${txs.length} transactions was created.`)
}
