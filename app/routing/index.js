
export function getTxLinkData(baseUrl, network, txType, seqNo) {
    const href=`${baseUrl}/tx?network=${network}&txType=${txType}&seqNo=${seqNo}`;
    const as=`/tx/${network}/${txType}/${seqNo}`;
    return {href, as}
}


