async function transformPoolUpgrade (tx) {
  if (tx.txn.data && tx.txn.data.schedule !== undefined) {
    const originalSchedule = Object.assign({}, tx.txn.data.schedule)
    tx.txn.data.schedule = []
    for (const scheduleKey of Object.keys(originalSchedule)) {
      const scheduleTime = originalSchedule[scheduleKey]
      tx.txn.data.schedule.push({ scheduleKey, scheduleTime })
    }
  }
  return tx
}

module.exports.transformPoolUpgrade = transformPoolUpgrade
