export function areTxsOfTypes (txs, ...expectedTypes) {
  for (const tx of txs) {
    if (!expectedTypes.includes(tx.txn.type)) {
      console.log(`Type of transaction ${JSON.stringify(tx)} is not one of these: ${JSON.stringify(expectedTypes)}`)
      return false
    }
  }
  return true
}

export function containsTxOfType (txs, expectedTxType) {
  for (const tx of txs) {
    if (expectedTxType === tx.txn.type) {
      return true
    }
  }
  return false
}

export function areTxsAfterTime (txs, utimeThreshold) {
  for (const tx of txs) {
    if (tx.txnMetadata.txnTime < utimeThreshold) {
      return false
    }
  }
  return true
}

export function areTxsBeforeTime (txs, utimeThreshold) {
  for (const tx of txs) {
    if (tx.txnMetadata.txnTime > utimeThreshold) {
      return false
    }
  }
  return true
}
