/* eslint-env jest */
const { createTransformerExpansion2State } = require('../../../src/transformers/transformer-expansion2state')

const processor = createTransformerExpansion2State({})

describe('did state', () => {
  it('should create state of genesis DID', async () => {
    const expansionTxGenesisTx = {
      'txn': {
        'data': {
          'alias': 'Phil Windley',
          'dest': 'NMjQb59rKTJXKNqVYfcZFi',
          'role': '0',
          'roleAction': 'SET_TRUSTEE',
          'verkey': 'Ce9jZ2bQcLRCrY3eT5AbjsU5mXFa4jMF6dDSF21tyeFJ',
          'verkeyFull': 'Ce9jZ2bQcLRCrY3eT5AbjsU5mXFa4jMF6dDSF21tyeFJ'
        },
        'metadata': {},
        'type': '1',
        'typeName': 'NYM'
      },
      'txnMetadata': {
        'seqNo': 1
      }
    }
    const { processedTx, format } = await processor.processTx(tx)
    expect(format).toBe('serialized')
    expect(JSON.stringify(processedTx)).toBe(JSON.stringify({ json: JSON.stringify(tx) }))
    expect(tx === processedTx).toBeFalsy()
  })

  // it('should create initial state of created DID', async () => {
  //   const expansionTxCreateTrusteeDid = {
  //     "txn": {
  //       "data": {
  //         "dest": "5M3i1PbpvEQmTk25EmAY6N",
  //         "role": "0",
  //         "roleAction": "SET_TRUSTEE",
  //         "verkey": "~7iwFwParUgTffA22Q5Tgvg",
  //         "verkeyFull": "5M3i1PbpvEQmTk25EmAY6N7iwFwParUgTffA22Q5Tgvg"
  //       },
  //       "metadata": {
  //         "digest": "e34b1c12d33e2a5f0b27c9e656b7615f1e8fa9ea9b3571fae2fa0a908ccc1e38",
  //         "from": "6feBTywcmJUriqqnGc1zSJ",
  //         "reqId": 1538601232057484000
  //       },
  //       "protocolVersion": 2,
  //       "type": "1",
  //       "typeName": "NYM"
  //     },
  //     "txnMetadata": {
  //       "seqNo": 8949,
  //       "txnId": "15ca9ff5843dd739ce79fd61bfac8f8bd29420b38e2e0d79e7d6e70f52858934",
  //       "txnTime": "2018-10-03T21:13:52.000Z"
  //     }
  //   }
  //   const { processedTx, format } = await processor.processTx(tx)
  //   expect(format).toBe('serialized')
  //   expect(JSON.stringify(processedTx)).toBe(JSON.stringify({ json: JSON.stringify(tx) }))
  //   expect(tx === processedTx).toBeFalsy()
  // })

})
