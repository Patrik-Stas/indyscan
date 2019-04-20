export function getTxLinkData (baseUrl, network, txType, seqNo) {
  const href = `${baseUrl}/tx?network=${network}&txType=${txType}&seqNo=${seqNo}`
  const as = `/tx/${network}/${txType}/${seqNo}`
  return { href, as }
}

/*
There's surely better ways, but for now, this works. indyscan.io redirects http->https, however, between nginx and
the actual application server the traffic is http. So when the request hits this app, it looks like it was talked to
in HTTP. This fact then propagates typically via NEXT.js's getInitialProps back to frontend, causing it eventually
make calls like http://indyscan.io/api/foobar (http), which won't work, because the user
is actually at https://indyscan.io (https)
 */
function getProtocol (req) {
  return (req && req.headers['host'] === 'indyscan.io') ? 'https' : req.protocol
}

export function getBaseUrl (req) {
  return req ? `${getProtocol(req)}://${req.get('Host')}` : ''
}
