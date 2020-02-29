async function intializeEsTarget (targetElasticsearch, format, processorMappings) {
  await targetElasticsearch.setMappings(format, processorMappings)
}

module.exports.intializeEsTarget = intializeEsTarget
