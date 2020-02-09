/*
esClient - elasticsearch client
esIndex - name of the index to read/write data from/to
esReplicaCount - if <esIndex> doesn't exist yet, it will be created with <esReplicaCount> replicas
subledgerName - indy subledger managed by this storage client
assureEsIndex - whether shall this storage client try to create index if it doesnt exists. This is useful if you creating multiple
                storage clients (different subledgers) for the same network in parallel
expectEsIndex - if true and the esIndex is not already created, it will throw
createEsTransformedTx - function taking 1 argument, a transaction as found on ledger. Returns somewhat transformed transaction
                      - the transformed tx must contains root "meta" field, might be empty object
                      - should never throw, if an error occurs during processing, it should be stored in the result under
                        tx.meta.transformError field
logger (optional) - winston logger
 */

const {setMapping} = require('./utils')
const {upsertSubdocument} = require('./utils')
const {assureEsIndex} = require('./utils')
const {createWinstonLoggerDummy} = require('./utils')

async function createStorageWriteEs (esClient, esIndex, esReplicaCount, logger) {
  if (logger === undefined) {
    logger = createWinstonLoggerDummy()
  }
  const whoami = `StorageWrite/${esIndex} : `

  await assureEsIndex(esClient, esIndex, esReplicaCount, logger)
  await setMappings({
    'properties': {
      'meta.subledger': {type: 'keyword'},
      'meta.seqNo': {type: 'integer'}
    }
  })

  async function setMappings (indexMappings) {
    logger.info(`${whoami} Setting up mappings for ES Index ${esIndex}!`)
    return setMapping(esClient, esIndex, indexMappings)
  }

  function uppercaseSubledger (subledgerName) {
    const knownSubledgers = ['DOMAIN', 'POOL', 'CONFIG']
    const subledgerNameUpperCase = subledgerName.toUpperCase()
    if (knownSubledgers.includes(subledgerNameUpperCase) === false) {
      throw Error(`${whoami} Unknown subledger '${subledgerNameUpperCase}'. Known ledger = ${JSON.stringify(knownSubledgers)}`)
    }
    return subledgerNameUpperCase
  }

  async function addTx (subledger, seqNo, format, txData) {
    subledger = uppercaseSubledger(subledger)
    logger.debug(`${whoami} Storing for subledger:${subledger} seqno:${seqNo} in format:${format}. Data: ${JSON.stringify(txData, null, 2)}!`)
    const persistData = {
      meta: {
        subledger,
        seqNo
      },
      [format]: {
        data: txData,
        meta: {
          updateTime: new Date().toISOString()
        }
      }
    }
    const docId = `${subledger}-${seqNo}`
    return upsertSubdocument(esClient, esIndex, docId, persistData)
  }

  return {
    addTx,
    setMappings
  }
}

module.exports.createStorageWriteEs = createStorageWriteEs
