
module.exports.getOldestTransactions = async function getOldestTransactions (ledgerStorageManager, networkRef) {
  const domain = await ledgerStorageManager.getLedger(networkRef, 'domain').getOldestTimestamp()
  const pool = await ledgerStorageManager.getLedger(networkRef, 'pool').getOldestTimestamp()
  const config = await ledgerStorageManager.getLedger(networkRef, 'config').getOldestTimestamp()
  const txsTimes = [domain, pool, config].filter(m => m != null)
  if (txsTimes.length === 0) {
    return null
  }
  return Math.min(...txsTimes)
}
