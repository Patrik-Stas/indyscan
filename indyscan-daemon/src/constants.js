const SOCKETIO_EVENT = {
  LEDGER_TX_SCANNED: 'ledger-tx-scanned',
  LEDGER_TX_SCAN_SCHEDULED: 'ledger-tx-scan-scheduled',
  SCANNED_TX_PROCESSED: 'tx-processed',
  SCANNED_TX_PROCESSING_SCHEDULED: 'tx-rescan-scheduled'
}

const INTERNAL_EVENT = {
  TX_RESCAN_SCHEDULED: 'tx-rescan-scheduled',
  TX_NOT_AVAILABLE: 'tx-not-available',
  TX_PROCESSED: 'tx-processed',
  TX_RESOLUTION_ERROR: 'tx-resolution-error',
  TX_INGESTION_ERROR: 'tx-ingestion-error'
}

const OPERATION_TYPES = {
  LEDGER_CPY: 'ledgercpy',
  EXPANSION: 'expansion'
}

module.exports = {
  OPERATION_TYPES,
  INTERNAL_EVENT,
  SOCKETIO_EVENT
}
