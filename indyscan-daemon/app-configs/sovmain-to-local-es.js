const path = require('path')

const config = {
  'view': {
    'INDY_NETWORK': 'SOVRIN_MAINNET',
    'TARGET_INDEX': 'txs-sovmain',
    'URL_ELASTICSEARCH': 'http://localhost:9200',
    'GENESIS_DIR': () => {
      return `${path.dirname(__dirname)}/genesis`
    }
  },
  'operations': ['standard-rtw-serialization']
}
module.exports = config
