import moment from 'moment'

export function extractTxInformation (tx) {
  const { rootHash } = tx
  const { type } = tx.txn
  const { txnId, txnTime, seqNo } = tx.txnMetadata
  const timestamp = txnTime
    ? moment(txnTime * 1000).format('MMMM Do YYYY, h:mm:ss a')
    : 'unknown'
  return { txnId, txnTime, seqNo, timestamp, type, rootHash }
}
