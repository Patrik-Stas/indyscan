
export function extractTxInformation(tx) {
    const {type} = tx.txn
    const {txnId, txnTime, seqNo} = tx.txnMetadata;
    const timestamp = !!(txnTime)
        ? new Date(txnTime * 1000).toISOString()
        : "unknown";
    return {txnId, txnTime, seqNo, timestamp}
}
