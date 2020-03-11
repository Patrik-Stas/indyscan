const fs = require('fs')
const sleep = require('sleep-promise')

/*
Note: The reason why we can't really do bulk is that before ledger tx is sent to storage, it's transformed and some
transformation require backward tx lookups - for example claim definitions lookups schema it's referring to.
 */
async function importFileToStorage (storage, filePath) {
  console.log(`Readng file ${filePath} for tx import.`)
  const lines = fs.readFileSync(filePath, 'utf-8')
    .split('\n')
    .filter(Boolean)
  for (const line of lines) {
    const tx = JSON.parse(line)
    // console.log(`Adding tx to storage`)
    await sleep(15)
    await storage.addTx(tx)
  }
}

module.exports.importFileToStorage = importFileToStorage
