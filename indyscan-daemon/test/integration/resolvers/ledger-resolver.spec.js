/* eslint-env jest */
const toCanonicalJson = require('canonical-json')
const { createTxResolverLedger } = require('../../../src/resolvers/ledger-resolver')

// TODO: the test should prepare the leger genesis file
const networks = ['SOVRIN_MAIN_NET']

describe('ledger tx resolution', () => {
  let txResolve

  beforeAll(async () => {
    txResolve = await createTxResolverLedger(networks)
  })

  it('should fetch domain tx from mainnet', async () => {
    const tx = await txResolve(networks, 'domain', 5)
    const expectedTx = {
      'reqSignature': {},
      'rootHash': 'HhWztVwXmpgYgdUu9noW4qQ3Pg3dEtQEoRUu2uP8Lqzw',
      'ver': '1',
      'txn': {
        'data': {
          'alias': 'Ron Amstutz',
          'verkey': '4fjHSUqU9RmeXWXHV6MnKFDtEyEcBUipovhNCDuei5XW',
          'dest': '7jJe9ArRfRchSKL2sYgFDj',
          'role': '0'
        },
        'type': '1',
        'metadata': {}
      },
      'auditPath': [
        '5zbp2uL6spPfbEF3hf4zWSXf96umXbBP3z5i5BBwmzVM'
      ],
      'txnMetadata': {
        'seqNo': 5
      }
    }
    expect(toCanonicalJson(tx)).toBe(toCanonicalJson(expectedTx))
  })

  it('should fetch domain tx from mainnet', async () => {
    const tx = await txResolve(networks, 'pool', 5)
    const expectedTx = {
      'txnMetadata': {
        'txnId': '56e1af48ef806615659304b1e5cf3ebf87050ad48e6310c5e8a8d9332ac5c0d8',
        'seqNo': 5
      },
      'txn': {
        'type': '0',
        'data': {
          'dest': 'D9oXgXC3b6ms3bXxrUu6KqR65TGhmC1eu7SUUanPoF71',
          'data': {
            'client_ip': '34.226.105.29',
            'client_port': '9701',
            'services': [
              'VALIDATOR'
            ],
            'node_ip': '34.226.105.29',
            'alias': 'digitalbazaar',
            'node_port': '9700'
          }
        },
        'metadata': {
          'from': 'rckdVhnC5R5WvdtC83NQp'
        }
      },
      'auditPath': [
        '2Ua91B2XKdj8zMZdnENLRvrGJoJ39dXTFAJbJSBZgBkb'
      ],
      'ver': '1',
      'reqSignature': {},
      'rootHash': 'BZxk72UTCYeTZexGyM7T1NySBRcW4az623oud8wL7DGg'
    }
    expect(toCanonicalJson(tx)).toBe(toCanonicalJson(expectedTx))
  })

  it('should fetch domain tx from mainnet', async () => {
    const tx = await txResolve(networks, 'config', 5)
    const expectedTx = {
      'txnMetadata': {
        'txnTime': 1506438185,
        'seqNo': 5
      },
      'txn': {
        'type': '110',
        'data': {
          'data': {
            'version': '1.1.37',
            'action': 'fail'
          }
        },
        'metadata': {
          'digest': 'c8c7dd5e6d616a33222d6b694d26caade4bb02d2b4e1ec2d5368bb39c1f9ab09',
          'from': 'C8W35r9D2eubcrnAjyb4F3PC3vWQS1BHDg7UvDkvdV6Q',
          'reqId': 1506438184944754
        }
      },
      'auditPath': [
        '8p4VmtwNrmhJKQwtuXVJruKxWi5yZKREaATZgNhu5dav'
      ],
      'ver': '1',
      'reqSignature': {
        'values': [
          {
            'from': 'C8W35r9D2eubcrnAjyb4F3PC3vWQS1BHDg7UvDkvdV6Q',
            'value': 'hwdTdY8P6Mn1uMTSmb76Mx8NFesdifUumkqzask65pAhvtCffHWxkFTfyW77gQVP2xMQHpdo8XAAEDPbXZoNxMQ'
          }
        ],
        'type': 'ED25519'
      },
      'rootHash': '47kjznDSeyGLkNDxXHR7QFtT9sGTDoQH3irGa9j7BXzw'
    }
    expect(toCanonicalJson(tx)).toBe(toCanonicalJson(expectedTx))
  })
})
