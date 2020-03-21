const PRESET_SLOW = {
  timeoutOnSuccess: 30 * 1000,
  timeoutOnTxIngestionError: 60 * 1000,
  timeoutOnLedgerResolutionError: 60 * 1000,
  timeoutOnTxNoFound: 30 * 1000,
  jitterRatio: 0.1
}

const PRESET_MEDIUM = {
  timeoutOnSuccess: 6 * 1000,
  timeoutOnTxIngestionError: 60 * 1000,
  timeoutOnLedgerResolutionError: 60 * 1000,
  timeoutOnTxNoFound: 20 * 1000,
  jitterRatio: 0.1
}

const PRESET_FAST = {
  timeoutOnSuccess: 1000,
  timeoutOnTxIngestionError: 30 * 1000,
  timeoutOnLedgerResolutionError: 30 * 1000,
  timeoutOnTxNoFound: 3 * 1000,
  jitterRatio: 0.1
}

const PRESET_TURBO = {
  timeoutOnSuccess: 500,
  timeoutOnTxIngestionError: 25 * 1000,
  timeoutOnLedgerResolutionError: 6 * 1000,
  timeoutOnTxNoFound: 1500,
  jitterRatio: 0.1
}

const scanConfigPresets = {
  SLOW: PRESET_SLOW,
  MEDIUM: PRESET_MEDIUM,
  FAST: PRESET_FAST,
  TURBO: PRESET_TURBO
}

function resolvePreset (presetName) {
  return scanConfigPresets[presetName]
}

function getDefaultPreset () {
  return PRESET_MEDIUM
}

module.exports.PRESET_SLOW = PRESET_SLOW
module.exports.PRESET_MEDIUM = PRESET_MEDIUM
module.exports.PRESET_FAST = PRESET_FAST
module.exports.PRESET_TURBO = PRESET_TURBO
module.exports.resolvePreset = resolvePreset
module.exports.getDefaultPreset = getDefaultPreset
