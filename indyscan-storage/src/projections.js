const projectAvailableTimestamps = (txs) => {
  return txs.filter(t => !!t.txnMetadata && !!t.txnMetadata.txnTime).map(t => t.txnMetadata.txnTime)
}

module.exports.projectAvailableTimestamps = projectAvailableTimestamps
