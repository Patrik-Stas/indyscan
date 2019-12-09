import moment from 'moment'

export function extractTxInformation (tx) {
  console.log(`extraction = ${JSON.stringify(tx)}`)
  const { rootHash } = tx
  const { type } = tx.txn
  const { txnId, txnTime, seqNo } = tx.txnMetadata
  const from = tx.txn.metadata ? tx.txn.metadata.from : 'not-available'
  const timestamp = txnTime
    ? moment(txnTime * 1000).format('MMMM Do YYYY, h:mm:ss a')
    : 'unknown'
  return { txnId, txnTime, seqNo, timestamp, type, rootHash, from }
}
