const path = require('path')
const fs = require('fs')
const rimraf = require('rimraf')
const { createIndyscanTransform } = require('indyscan-daemon/src/processors/transformation/transform-tx')
const txSchemaDef = require('../resource/sample-txs/tx-domain-schema')

function writeToFiles (targetDir, originalFilename, originalTx, transformedTx) {
  fs.writeFileSync(`${targetDir}/${originalFilename}`, JSON.stringify(originalTx, null, 2))
  fs.writeFileSync(`${targetDir}/${originalFilename}-transformed.json`, JSON.stringify(transformedTx, null, 2))
}

let esTransform = createIndyscanTransform((seqno) => {
  if (seqno === 74631) {
    return txSchemaDef
  } else {
    throw Error(`Mock for tx ${seqno} was not prepared.`)
  }
})

function run () {
  const directoryPath = path.join(__dirname, '../resource/sample-txs')
  let targetDir = './transforms'

  rimraf.sync(targetDir)
  fs.mkdirSync(targetDir)

  let files = fs.readdirSync(directoryPath)
  files.forEach(async function (file) {
    let originalTx = require(`./indyscan-storage/test/resource/sample-txs`)
    let transformedTx = await esTransform(originalTx)
    writeToFiles(targetDir, file, originalTx, transformedTx)
  })
}

run()
