const { txTypeToSubledgerName } = require('indyscan-txtype')

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
async function createStorageWriteEs (esClient, esIndex, esReplicaCount, subledgerName, assureEsIndex, expectEsIndex, transformTx, logger) {
  const knownSubledgers = ['DOMAIN', 'POOL', 'CONFIG']
  const subledgerNameUpperCase = subledgerName.toUpperCase()
  if (knownSubledgers.includes(subledgerNameUpperCase) === false) {
    throw Error(`Unknown subledger '${subledgerNameUpperCase}'. Known ledger = ${JSON.stringify(knownSubledgers)}`)
  }
  const existsResponse = await esClient.indices.exists({ index: esIndex })
  const { body: indexExists } = existsResponse
  if (indexExists === undefined || indexExists === null) {
    throw Error(`Can't figure out if index ${esIndex} exists in ES. ES Response: ${JSON.stringify(existsResponse)}.`)
  }

  if (expectEsIndex && !indexExists) {
    throw Error(`Index ${esIndex} was expected to already exist, but did not!`)
  }
  if (assureEsIndex && !indexExists) {
    await createEsIndex()
  }

  async function createEsIndex () {
    let createIndexRes = await esClient.indices.create({
      index: esIndex,
      body: {
        settings: {
          index: {
            number_of_replicas: esReplicaCount
          }
        }
      }
    })
    if (createIndexRes.statusCode !== 200) {
      throw Error(`Problem creating index ${esIndex}. ES Response: ${createIndexRes}`)
    }

    const coreMappings = {
      index: esIndex,
      body: {
        'properties': {
          'original': { type: 'text', index: false },

          // Every tx
          'indyscan.ver': { type: 'keyword' },
          'indyscan.rootHash': { type: 'keyword' },
          'indyscan.txn.type': { type: 'keyword' },
          'indyscan.txn.typeName': { type: 'keyword' },
          'indyscan.subledger.code': { type: 'keyword' },
          'indyscan.subledger.name': { type: 'keyword' },
          'indyscan.txn.protocolVersion': { type: 'keyword' },
          'indyscan.txn.metadata.from': { type: 'keyword' },
          'indyscan.txn.metadata.reqId': { type: 'keyword' },
          'indyscan.txn.data.data.blskey': { type: 'keyword' },
          'indyscan.txn.data.data.blskey_pop': { type: 'keyword' },
          'indyscan.meta.scanTime': { type: 'date', format: 'date_time' },

          'indyscan.txnMetadata.seqNo': { type: 'integer' },
          'indyscan.txnMetadata.txnTime': { type: 'date', format: 'date_time' },

          // TX: NYM, ATTRIB
          'indyscan.txn.data.raw': { type: 'text' },
          'indyscan.txn.data.dest': { type: 'keyword' },
          'indyscan.txn.data.verkeyFull': { type: 'keyword' },
          'indyscan.txn.data.roleAction': { type: 'keyword' },

          // TX: CLAIM_DEF
          'indyscan.txn.data.refSchemaTxnSeqno': { type: 'integer' },
          'indyscan.txn.data.refSchemaTxnTime': { type: 'date', format: 'date_time' },
          'indyscan.txn.data.refSchemaVersion': { type: 'keyword' },
          'indyscan.txn.data.refSchemaFrom': { type: 'keyword' },


          // TX: pool NODE transaction
          'indyscan.txn.data.data.client_ip': { type: 'ip' },
          'indyscan.txn.data.data.client_port': { type: 'integer' },
          'indyscan.txn.data.data.node_ip': { type: 'ip' },
          'indyscan.txn.data.data.node_port': { type: 'integer' },

          // TX: NODE tx geo information
          'indyscan.txn.data.data.client_ip_geo.location': { type: 'geo_point' },
          'indyscan.txn.data.data.client_ip_geo.eu': { type: 'boolean' },
          'indyscan.txn.data.data.node_ip_geo.location': { type: 'geo_point' },
          'indyscan.txn.data.data.node_ip_geo.eu': { type: 'boolean' },

          // TX: domain AUTHOR_AGREEMENT_AML
          'indyscan.txn.data.aml.at_submission': { type: 'text', analyzer: 'english' },
          'indyscan.txn.data.aml.click_agreement': { type: 'text', analyzer: 'english' },
          'indyscan.txn.data.aml.for_session': { type: 'text', analyzer: 'english' },
          'indyscan.txn.data.aml.on_file': { type: 'text', analyzer: 'english' },
          'indyscan.txn.data.aml.product_eula': { type: 'text', analyzer: 'english' },
          'indyscan.txn.data.aml.service_agreement': { type: 'text', analyzer: 'english' },
          'indyscan.txn.data.aml.wallet_agreement': { type: 'text', analyzer: 'english' },

          // TX: domain AUTHOR_AGREEMENT
          'indyscan.txn.data.text': { type: 'text', analyzer: 'english' }
        }
      }
    }
    await esClient.indices.putMapping(coreMappings)
  }

  async function addTx (tx) {
    if (!tx || !tx.txnMetadata || tx.txnMetadata.seqNo === undefined || tx.txnMetadata.seqNo === null) {
      throw Error(`Tx failed basic validation. Tx ${JSON.stringify(tx)}`)
    }
    let recognizedSubledger = txTypeToSubledgerName(tx.txn.type)
    if (recognizedSubledger === undefined || recognizedSubledger === null) {
      if (logger) {
        logger.warn(`Can't verify which subledger txn.type '${tx.txn.type}' belongs to. Maybe a new Indy tx type?`)
      }
    } else if (recognizedSubledger.toUpperCase() !== subledgerNameUpperCase) {
      throw Error(`Won't add transaction to storage. It is considered to belong to ${recognizedSubledger}` +
        ` but attempt was made to add it to storage for subledger '${subledgerNameUpperCase}'.` +
        ` The transaction: '${JSON.stringify(tx)}'.`)
    }
    let transformed = await transformTx(tx)
    transformed.meta.scanTime = new Date().toISOString()
    let data = {
      original: JSON.stringify(tx),
      indyscan: transformed
    }
    await esClient.index({
      id: `${subledgerNameUpperCase}-${tx.txnMetadata.seqNo}`,
      index: esIndex,
      body: data
    })
  }

  return {
    addTx
  }
}

module.exports.createStorageWriteEs = createStorageWriteEs
