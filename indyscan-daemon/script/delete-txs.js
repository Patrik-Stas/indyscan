const { createStorageWriteEs } = require('indyscan-storage')
const elasticsearch = require('@elastic/elasticsearch')

const index = `txs-sovmain`
const subledger = `domain`
const url = 'http://localhost:9200'
const seqNoGte = 401

async function run() {
  const esClient = new elasticsearch.Client({ node: url })
  let storageWrite
  try {
    storageWrite = await createStorageWriteEs(esClient, index, 0)
  } catch (err) {
    throw Error(`Failed to create ES storage for index ${index}. Details: ${err.message} ${err.stack}`)
  }
  console.log(`Going to delete txs above seqNo ${seqNoGte} on ES ${url}, index ${index}, subledger ${subledger}`)
  await storageWrite.deleteTxsByGteSeqNo(subledger, seqNoGte)
  console.log(`Deletion complete.`)
}

run()
