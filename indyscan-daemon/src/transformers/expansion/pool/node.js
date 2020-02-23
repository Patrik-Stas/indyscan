function createNodeTransform (geoipLiteLookupIp) {
  function transformNode (tx) {
    if (tx.txn && tx.txn.data && tx.txn.data.data) {
      const { client_ip: clientIp, node_ip: nodeIp } = tx.txn.data.data
      const geoClientIp = geoipLiteLookupIp(clientIp)
      if (geoClientIp) {
        tx.txn.data.data.client_ip_geo = {}
        tx.txn.data.data.client_ip_geo.country = geoClientIp.country
        tx.txn.data.data.client_ip_geo.region = geoClientIp.region
        tx.txn.data.data.client_ip_geo.eu = geoClientIp.eu === '1'
        tx.txn.data.data.client_ip_geo.timezone = geoClientIp.timezone
        tx.txn.data.data.client_ip_geo.city = geoClientIp.city
        tx.txn.data.data.client_ip_geo.location = { lat: geoClientIp.ll[0], lon: geoClientIp.ll[1] }
      }
      const geoNodeIp = geoipLiteLookupIp(nodeIp)
      if (geoNodeIp) {
        tx.txn.data.data.node_ip_geo = {}
        tx.txn.data.data.node_ip_geo.country = geoNodeIp.country
        tx.txn.data.data.node_ip_geo.region = geoNodeIp.region
        tx.txn.data.data.node_ip_geo.eu = geoNodeIp.eu === '1'
        tx.txn.data.data.node_ip_geo.timezone = geoNodeIp.timezone
        tx.txn.data.data.node_ip_geo.city = geoNodeIp.city
        tx.txn.data.data.node_ip_geo.location = { lat: geoNodeIp.ll[0], lon: geoNodeIp.ll[1] }
      }
    }
    return tx
  }

  return transformNode
}

module.exports.createNodeTransform = createNodeTransform
