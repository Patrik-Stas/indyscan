const SOCKETIO_EVENT = {
  LEDGER_TX_SCANNED: 'ledger-tx-scanned',
  LEDGER_TX_SCAN_SCHEDULED: 'ledger-tx-scan-scheduled',
  SCANNED_TX_PROCESSED: 'tx-processed',
  SCANNED_TX_PROCESSING_SCHEDULED: 'tx-rescan-scheduled'
}

module.exports = {
  SOCKETIO_EVENT
}
