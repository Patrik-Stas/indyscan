async function intializeEsTarget(target, processorMappings) {
  await targetElasticsearch.setMappings(processorMappings)
}

module.exports.intializeEsTarget = intializeEsTarget
