const util = require('util')

function createWinstonLoggerDummy () {
  let logger = {}
  logger.error = (param1, param2) => {}
  logger.warn = (param1, param2) => {}
  logger.info = (param1, param2) => {}
  logger.debug = (param1, param2) => {}
  logger.silly = (param1, param2) => {}
  return logger
}

async function assureEsIndex(esClient, esIndex, replicaCount, logger) {
  const exists = await indexExists(esClient, esIndex)
  if (!exists) {
    return createEsIndex(esClient, esIndex, replicaCount, logger)
  }
}

async function indexExists(esClient, index) {
  const existsResponse = await esClient.indices.exists({index})
  const { body: indexExists } = existsResponse
  if (indexExists === undefined || indexExists === null) {
    throw Error(`Can't figure out if index ${esIndex} exists in ES. ES Response: ${JSON.stringify(existsResponse)}.`)
  }
  return indexExists
}

async function createEsIndex (esClient, esIndex, replicaCount, logger) {
  logger.info(`Creating ES Index ${esIndex}!`)
  let createIndexRes = await esClient.indices.create({
    index: esIndex,
    body: {
      settings: {
        index: {
          number_of_replicas: replicaCount
        }
      }
    }
  })
  if (createIndexRes.statusCode !== 200) {
    throw Error(`Problem creating index ${esIndex}. ES Response: ${createIndexRes}`)
  }
}

async function searchOneDocument (esClient, esIndex, query) {
  const searchPayloadd = {
    index: esIndex,
    body: { query }
  }
  const { body } = await esClient.search(searchPayloadd)
  if (!(body || body.hits || body.hits.hits)) {
    throw Error(`Invalid response from ElasticSearch: ${JSON.stringify(body)}`)
  }
  if (body.hits.hits.length > 1) {
    throw Error(`Requested tx seqno ${seqNo} but ${body.hits.hits.length} documents were returned. Should only be 1.`)
  }
  if (body.hits.hits.length === 0) {
    return null
  }
  return body.hits.hits[0]['_source']
}

async function upsertSubdocument(esClient, esIndex, id, subdoc) {
  return esClient.update({
    index: esIndex,
    id,
    body: {
      "doc": subdoc,
      "doc_as_upsert" : true
    }
  })
}

async function getDocument(esClient, esIndex, id) {
  let res = await esClient.get({
    index: esIndex,
    id
  })
  return res.body._source
}

async function setMapping(esClient, esIndex, indexMappings) {
  const coreMappings = {
    index: esIndex,
    body:
      indexMappings
  }
  console.log(JSON.stringify(coreMappings))
  return esClient.indices.putMapping(coreMappings)
}

async function getMapping(esClient, esIndex) {
  return esClient.indices.getMapping({
    index: esIndex
  })
}

async function deleteIndex (esClient, index) {
  return esClient.indices.delete({index})
}


module.exports.indexExists = indexExists
module.exports.assureEsIndex = assureEsIndex
module.exports.deleteIndex = deleteIndex
module.exports.createWinstonLoggerDummy = createWinstonLoggerDummy
module.exports.searchOneDocument = searchOneDocument
module.exports.upsertSubdocument = upsertSubdocument
module.exports.getDocument = getDocument
module.exports.setMapping = setMapping
module.exports.getMapping = getMapping

