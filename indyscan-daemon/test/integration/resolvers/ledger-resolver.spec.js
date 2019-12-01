/* eslint-env jest */
const toCanonicalJson = require('canonical-json')
const { createTxResolverLedger } = require('../../../src/resolvers/ledger-resolver')

describe('ledger tx resolution', () => {
  let txResolve
  let network = 'SOVRIN_MAINNET'

  beforeAll(async () => {
    // TODO: the test should prepare the leger genesis file
    txResolve = await createTxResolverLedger(network)
  })

  it('should fetch domain tx from mainnet', async () => {
    const tx = await txResolve('domain', 5)
    const expectedTx = {
      reqSignature: {},
      txnMetadata: { seqNo: 5 },
      ledgerSize: 53991,
      ver: '1',
      auditPath:
        ['BundPDf5zSqmLwYap143agwrnKVrftPrQKi5EMrpdKap',
          '7Vn6LAc5EJxpBDoHCB1XfuxsnfextRjvKgBjbV1RMYY1',
          '5zbp2uL6spPfbEF3hf4zWSXf96umXbBP3z5i5BBwmzVM',
          '2gCD8YRUUMVZyJ7TLXT4qbCxw1h1hijX8koaLDFc1bJq',
          'BuvAvcc92Tgwu6PUFMZY21WM3dg5KD1fhfFHkdgGfGWJ',
          '6xzkXYsfhy2LRBpkwb4n2zJwrgNrDTQKvnk4oP8e9jvM',
          'EAbTZdeMabd5aW59CbyhQ1q7MRpHXMFVzcJFQSz6yCV3',
          '94F6q15MhEhQeijZuA1zerM2oefBbUiifdzdbcQ7hKPN',
          '4bmnnZRY1RtMhdLcEcKy5FccPdt27iH45PiVAuoBMwsj',
          '3fdwTL8jHHQYfzNrtmZ4yLzGNEUC65hwMSVT86Uf7PQh',
          '8UpRMwf1YwhqZUVARivJwkSFqe91ft4jipgo8Z1Xaeh4',
          'BQPTuYEpmnZQ6GdjBAzHBGJVzkpWnfNMNGNpyJ8LAQZ',
          'G8L5Sz9pPT351NkVvYWV6kcwR1ycwEAsk5pQZApTPbsA',
          '4jGpg6VrrSKmZrwQozupNCEkpmsMdekGt4SkAzuHmqHP',
          'CCuh1YQexAhFwvVagcGc7knXUoinjz4hShneqMacvhN3',
          'AZbqixtxE6SQxo4gBvqUcbBcos4Uc9X2KB1DT8PhCaSW'],
      txn:
        {
          metadata: {},
          type: '1',
          data:
            {
              role: '0',
              verkey: '4fjHSUqU9RmeXWXHV6MnKFDtEyEcBUipovhNCDuei5XW',
              dest: '7jJe9ArRfRchSKL2sYgFDj',
              alias: 'Ron Amstutz'
            }
        },
      rootHash: 'Fd8Hk1oFBKdMdsX4NoX5sZwrBdy4aoY2rUa7xeS7Xhjk'
    }
    expect(toCanonicalJson(tx)).toBe(toCanonicalJson(expectedTx))
  })

  it('should fetch pool tx from mainnet', async () => {
    const tx = await txResolve('pool', 5)
    const expectedTx = {
      ledgerSize: 95,
      auditPath:
        ['5PLVc6UWJbZfaAUVzNeuhokFRwEkmYziDi2wbeyemcSC',
          '51V6m6b317fnzgJR6vK7YxJtFLm1BaYJWbvrQVE3Wc5d',
          '2Ua91B2XKdj8zMZdnENLRvrGJoJ39dXTFAJbJSBZgBkb',
          'DzyZENNsauAWJfY5yJpSGk3o4gAFxWv6bUnAJBhMSnSm',
          '5o2Up5cKuvqBb1S6CgVpAnkoXSzaSV4KyAam147jwz7d',
          '7eUFJhUyGtFcFsTXP1VbqA9CLHfHebgJXQbvqJ7YMxWj',
          '6z7fwNvgNJrS1Zgrhnhc8kZXBFkojqrwaMpbkPmp7s6f'],
      rootHash: '64KUHBRJtK6kWPFgZXcWA4P6jp13NwcbaN6pbmY6rzUv',
      reqSignature: {},
      txnMetadata:
        {
          txnId: '56e1af48ef806615659304b1e5cf3ebf87050ad48e6310c5e8a8d9332ac5c0d8',
          seqNo: 5
        },
      txn:
        {
          type: '0',
          metadata: { from: 'rckdVhnC5R5WvdtC83NQp' },
          data:
            {
              dest: 'D9oXgXC3b6ms3bXxrUu6KqR65TGhmC1eu7SUUanPoF71',
              data:
                {
                  client_port: '9701',
                  alias: 'digitalbazaar',
                  client_ip: '34.226.105.29',
                  node_port: '9700',
                  services: ['VALIDATOR'],
                  node_ip: '34.226.105.29'
                }
            }
        },
      ver: '1'
    }
    expect(toCanonicalJson(tx)).toBe(toCanonicalJson(expectedTx))
  })

  it('should fetch config tx from mainnet', async () => {
    const tx = await txResolve('config', 5)
    const expectedTx = {
      txnMetadata: { seqNo: 5, txnTime: 1506438185 },
      rootHash: 'PJUvv3XtBmEi43sS7UWC8RtLitSY1ygdBBfLe44WDZh',
      ledgerSize: 7810,
      auditPath:
        ['213NG5eZ6yYeQx57upLvpnKoTdNGGrbxBSVCtKhDjfxi',
          '8vWmiaoJQXB92AqCwL2cLZUMWdWafmX35V4c5MzYgFA8',
          '8p4VmtwNrmhJKQwtuXVJruKxWi5yZKREaATZgNhu5dav',
          'CzyaM2iLHZn3egbMRT6gNRUMyNhx8ezVQv4Yi8Fr758o',
          '7UCEs8AJgxCLSM8g35WFkZrenMxYBRfYS5N2E2Zkzf5L',
          'J4QpoCwm7ZrzDGLHoMHZrWsGrUtUJx4tEiA92k56pKU3',
          '9FzznNDif6NvbTT3nTLpJH6fGNktNbbGJLokVVSYCjBb',
          '3BAXt1m4GHTRgo78P7BWAkCV3CgcgDSAyMrXwgE5KvzZ',
          '6vB8YaYBNa9765PkcZ5MLtFMtSFKwzewvjHtSuasrqqb',
          'HwFUunP4uiYerr6gUkNHparvnJvN89mRBbDDUGjh8rpY',
          'HRYuzVKYvKDGZpQFqJR7QfFSPydS2jgp4i9z8LDuKmZD',
          'Hr3WVqFbNbAi85nxWKKPH3dWT9Voj5GnKrstS4Fs1VfC',
          '9bexpFs1kH7RmDm1TcV3mWSApNuwFEMNoXgPL2LGpEVu'],
      ver: '1',
      txn:
        {
          type: '110',
          data: { data: { action: 'fail', version: '1.1.37' } },
          metadata:
            {
              reqId: 1506438184944754,
              digest: 'c8c7dd5e6d616a33222d6b694d26caade4bb02d2b4e1ec2d5368bb39c1f9ab09',
              from: 'C8W35r9D2eubcrnAjyb4F3PC3vWQS1BHDg7UvDkvdV6Q'
            }
        },
      reqSignature:
        {
          type: 'ED25519',
          values:
            [{
              value: 'hwdTdY8P6Mn1uMTSmb76Mx8NFesdifUumkqzask65pAhvtCffHWxkFTfyW77gQVP2xMQHpdo8XAAEDPbXZoNxMQ',
              from: 'C8W35r9D2eubcrnAjyb4F3PC3vWQS1BHDg7UvDkvdV6Q'
            }]
        }
    }
    expect(toCanonicalJson(tx)).toBe(toCanonicalJson(expectedTx))
  })

  it('should return if transaction does not exist on ledger', async () => {
    const tx = await txResolve('pool', 100000000)
    expect(tx).toBe(null)
  })
})
