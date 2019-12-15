async function transformPoolUpgrade (tx) {
  if (tx.txn.data && tx.txn.data.schedule !== undefined) {
    let originalSchedule = Object.assign({}, tx.txn.data.schedule)
    tx.txn.data.schedule = []
    for (const scheduleKey of Object.keys(originalSchedule)) {
      let scheduleTime = originalSchedule[scheduleKey]
      tx.txn.data.schedule.push({scheduleKey, scheduleTime})
    }
  }
  return tx
}

module.export.transformPoolUpgrade = transformPoolUpgrade
