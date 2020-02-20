async function intializeEsTarget (targetElasticsearch, processorMappings) {
  await targetElasticsearch.setMappings(processorMappings)
}

module.exports.intializeEsTarget = intializeEsTarget
