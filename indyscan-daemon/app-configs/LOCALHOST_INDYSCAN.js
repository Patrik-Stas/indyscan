const config = [
  {
    'view': {
      'INDY_NETWORK': 'LOCALHOST_INDYSCAN',
      'TARGET_INDEX': 'txs-localhost',
      'URL_ELASTICSEARCH': 'http://localhost:9200',
      'GENESIS_DIR': () => {
        return `${path.dirname(__dirname)}/genesis`
      }
    },
    'operations': ['standard-rtw-serialization']
    }
]

module.exports = config
