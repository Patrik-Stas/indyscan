const path = require('path')

const config = {
  'view': {
    'INDY_NETWORK': 'HOST_DOCKER_INTERNAL',
    'TARGET_INDEX': 'txs-2localhost',
    'URL_ELASTICSEARCH': 'http://localhost:9200',
    'GENESIS_DIR': () => {
      return `${__dirname}/genesis`
    }
  },
  'operations': ['standard-rtw-serialization']
}

module.exports = config
