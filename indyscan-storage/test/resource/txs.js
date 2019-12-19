const txSchema = {
  auditPath: [
    'ANkXtwhi2x4XUKuPA7y4shbNcsg7UjCpAkHeAgwuELx7',
    'BViF4bqQuoyyZW3TACjLUbHvB7v3evZYenn1ysYnfE1H',
    'CYMYrwPtXtnaBGR7KZn3PMTQnXpJZJhXEVJFhxGVvD4E',
    'Cegr1xtGTZ4vqUUKLBzdA5gyp5YSNKaV3RG5oGiufRm9',
    'EbNc45XGkHjTdeE1jPmFU9HKbknrbe1iqfjoK1BG3Vnm',
    'As43mmyHTVtmt7Wxu3TRY5jx56DYNrGEWs8cqnf2kQhS'
  ],
  ledgerSize: 393,
  reqSignature: {
    type: 'ED25519',
    values: [
      {
        from: 'KuXsPLZAsxgjbaAeQd4rr8',
        value: '3xzRvUSbELNVEjxZhoB9RRSahnudptaesfrFvUUWGGEPuEcmuEi7madUnvVU3zbarCFwephRTrwgHCBZAdbBKzpp'
      }
    ]
  },
  rootHash: 'DC8SpjcjASFKRKEXb72wx2Yj2TVoUiR7t2eyCJjZhvGX',
  txn: {
    data: {
      data: {
        attr_names: [
          'position',
          'userID'
        ],
        name: 'SeLFSchemaAries4',
        version: '1.1'
      }
    },
    metadata: {
      digest: 'cdb3c763200e01320b0681d2c38bf9269239e834b7371eb232710e1311734837',
      from: 'KuXsPLZAsxgjbaAeQd4rr8',
      payloadDigest: 'e913e0d3009f59617cfe21e5ea0e98d6558b607673bbd67a15318d65dde3e899',
      reqId: 1574776370318133000,
      taaAcceptance: {
        mechanism: 'at_submission',
        taaDigest: '920e68ff43bf157d657e35fca291baa00f8b14c395cddf6e4b4e156391baf7cd',
        time: 1574726400
      }
    },
    protocolVersion: 2,
    type: '101'
  },
  txnMetadata: {
    seqNo: 386,
    txnId: 'KuXsPLZAsxgjbaAeQd4rr8:2:SeLFSchemaAries4:1.1',
    txnTime: 1574776370
  },
  ver: '1'
}

module.exports.txSchema = txSchema
