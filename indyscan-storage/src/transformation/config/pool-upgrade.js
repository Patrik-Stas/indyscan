async function transformPoolUpgrade (tx) {
  if (tx.txn.data && tx.txn.data.schedule !== undefined) {
    let originalSchedule = Object.assign({}, tx.txn.data.schedule)
    tx.txn.data.schedule = []
    for (const scheduleKey of Object.keys(originalSchedule)) {
      let scheduleTime = originalSchedule[scheduleKey]
      if (scheduleKey === 'BLu5t8JVbpHrRrocSx1HtMqJC8xruDLisaYZMZverkBs' &&
        scheduleTime === '2019-07-15T10:11.555000-06:00') {
        scheduleTime = '2019-07-15T10:11:00.555000-06:00' // corrupted format staging net config transaction 24933
      }
      tx.txn.data.schedule.push({ scheduleKey, scheduleTime })
    }
  }
  return tx
}

module.exports.transformPoolUpgrade = transformPoolUpgrade
