/* eslint-env jest */
const toCanonicalJson = require('canonical-json')
const {createSourceElasticsearch} = require('../../../src/sources/source-elasticsearch')
const path = require('path')

describe('ledger tx resolution', () => {
  let mainnetSource

  beforeAll(async () => {
    jest.setTimeout(1000 * 30)
    mainnetSource = await createSourceElasticsearch({
      id: 'testsource',
      name: 'integration-test-mainnet-source',
      genesisPath: path.resolve(__dirname, '../../../app-config/genesis/SOVRIN_MAINNET.txn')
    })
  })

  it('should fetch domain tx from mainnet', async () => {
    const tx = await mainnetSource.getTxData('domain', 5)
    const expectedTx = {
      metadata: {},
      type: '1',
      data:
        {
          role: '0',
          verkey: '4fjHSUqU9RmeXWXHV6MnKFDtEyEcBUipovhNCDuei5XW',
          dest: '7jJe9ArRfRchSKL2sYgFDj',
          alias: 'Ron Amstutz'
        }
    }
    const expectedMetadata = {
      seqNo: 5
    }
    expect(toCanonicalJson(tx.txn)).toBe(toCanonicalJson(expectedTx))
    expect(toCanonicalJson(tx.txnMetadata)).toBe(toCanonicalJson(expectedMetadata))
  })
  //
  // it('should fetch pool tx from mainnet', async () => {
  //   const tx = await mainnetSource.getTxData('pool', 5)
  //   const expectedTx = {
  //     type: '0',
  //     metadata: {from: 'rckdVhnC5R5WvdtC83NQp'},
  //     data:
  //       {
  //         dest: 'D9oXgXC3b6ms3bXxrUu6KqR65TGhmC1eu7SUUanPoF71',
  //         data:
  //           {
  //             client_port: '9701',
  //             alias: 'digitalbazaar',
  //             client_ip: '34.226.105.29',
  //             node_port: '9700',
  //             services: ['VALIDATOR'],
  //             node_ip: '34.226.105.29'
  //           }
  //       }
  //   }
  //   const expectedMetadata = {
  //     seqNo: 5,
  //     txnId: '56e1af48ef806615659304b1e5cf3ebf87050ad48e6310c5e8a8d9332ac5c0d8'
  //   }
  //   expect(toCanonicalJson(tx.txn)).toBe(toCanonicalJson(expectedTx))
  //   expect(toCanonicalJson(tx.txnMetadata)).toBe(toCanonicalJson(expectedMetadata))
  // })
  //
  // it('should fetch config tx from mainnet', async () => {
  //   const tx = await mainnetSource.getTxData('config', 5)
  //   const expectedTx = {
  //     type: '110',
  //     data: {data: {action: 'fail', version: '1.1.37'}},
  //     metadata:
  //       {
  //         reqId: 1506438184944754,
  //         digest: 'c8c7dd5e6d616a33222d6b694d26caade4bb02d2b4e1ec2d5368bb39c1f9ab09',
  //         from: 'C8W35r9D2eubcrnAjyb4F3PC3vWQS1BHDg7UvDkvdV6Q'
  //       }
  //   }
  //   const expectedMetadata = {seqNo: 5, txnTime: 1506438185}
  //   expect(toCanonicalJson(tx.txn)).toBe(toCanonicalJson(expectedTx))
  //   expect(toCanonicalJson(tx.txnMetadata)).toBe(toCanonicalJson(expectedMetadata))
  // })
  //
  // it('should return if transaction does not exist on ledger', async () => {
  //   const tx = await mainnetSource.getTxData('pool', 1000000000)
  //   expect(tx).toBe(null)
  // })
})
