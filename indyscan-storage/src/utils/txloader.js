const fs = require('fs')

async function importFileToStorage (storage, filePath) {
  let lines = fs.readFileSync(filePath, 'utf-8')
    .split('\n')
    .filter(Boolean)
  for (const line of lines) {
    const tx = JSON.parse(line)
    await storage.addTx(tx)
  }
}

module.exports.importFileToStorage = importFileToStorage
