const path = require('path')
const fs = require('fs')
const logger = require('../logging/logger-main')
const { getDefaultPreset, resolvePreset } = require('./presets-consumer')

function getExpandedConsumerOptions (consumerConfig) {
  let expendedStorageConfig = consumerConfig ? Object.assign({}, consumerConfig) : { type: 'sequential', data: {} }
  if (expendedStorageConfig.type !== 'sequential') {
    throw Error(`Unknown consumer type ${expendedStorageConfig.type}`)
  }
  if (!expendedStorageConfig.data.preset) {
    expendedStorageConfig.data.preset = 'MEDIUM'
  }
  let presetData = resolvePreset(expendedStorageConfig.data.preset) || getDefaultPreset()
  expendedStorageConfig.data = Object.assign(presetData, expendedStorageConfig.data)
  return expendedStorageConfig
}

function getExpendedStorageConfig (storageConfig, globalEsUrl) {
  let expendedStorageConfig = Object.assign({}, storageConfig)
  if (expendedStorageConfig.type === 'elasticsearch') {
    if (expendedStorageConfig.data.url === undefined) {
      expendedStorageConfig.data.url = globalEsUrl
    }
    if (expendedStorageConfig.data.replicas === undefined) {
      expendedStorageConfig.data.replicas = 0
    }
  } else {
    throw Error(`Storage config ${expendedStorageConfig.type} is not currently supported.`)
  }
  return expendedStorageConfig
}

async function getExpandedSourceConfig (sourceConfig, configBasePath) {
  let expandedSourceConfig = Object.assign({}, sourceConfig)
  if (expandedSourceConfig.type !== 'ledger') {
    throw Error(`Source type '${expandedSourceConfig.type}' is not supported.`)
  }
  if (expandedSourceConfig.data.name === undefined) {
    throw Error(`Source configuration of 'ledger' type must specify field 'name'.`)
  }
  const { genesisReference } = expandedSourceConfig.data
  if (genesisReference) {
    const pathToGenesis = `${configBasePath}/${genesisReference}`
    expandedSourceConfig.data.genesisPath = pathToGenesis
    if (!fs.lstatSync(pathToGenesis).isFile()) {
      logger.warn(`Constructed genesisPath ${pathToGenesis} but it does not point to a file.`)
    }
  }
  return expandedSourceConfig
}

function loadScanConfigs (configPath) {
  const configData = fs.readFileSync(configPath)
  const scanConfigs = JSON.parse(configData)
  if (scanConfigs.length === 0) {
    throw Error('At least 1 network must be present in network configurations file.')
  }
  return scanConfigs
}

async function processScanConfig (scanConfig, configDirectory) {
  const { name } = scanConfig
  const consumerConfig = getExpandedConsumerOptions(scanConfig.consumerConfig)
  const sourceConfig = await getExpandedSourceConfig(scanConfig.sourceConfig, configDirectory)
  const storageConfig = getExpendedStorageConfig(scanConfig.storageConfig)
  return { name, consumerConfig, sourceConfig, storageConfig }
}

function basicScanConfigValidation (scanConfig) {
  if (!scanConfig.name) {
    throw Error(`Scan config must specify field 'name'.`)
  }
  if (!scanConfig.sourceConfig || !scanConfig.sourceConfig.type) {
    throw Error(`Network config must specify 'source' and 'source.type'`)
  }
  if (!scanConfig.storageConfig || !scanConfig.storageConfig.type) {
    throw Error(`Network config must specify 'storage' and 'storage.type'`)
  }
}

async function processScanConfigFile (scanConfigsPath) {
  const scanConfigs = loadScanConfigs(scanConfigsPath)
  let result = []
  const scanConfigDirectory = path.dirname(scanConfigsPath)
  for (const scanConfig of scanConfigs) {
    basicScanConfigValidation(scanConfig)
    const { name, consumerConfig, sourceConfig, storageConfig } = await processScanConfig(scanConfig, scanConfigDirectory)
    result.push({ name, consumerConfig, sourceConfig, storageConfig })
  }
  return result
}

module.exports.processScanConfigFile = processScanConfigFile
