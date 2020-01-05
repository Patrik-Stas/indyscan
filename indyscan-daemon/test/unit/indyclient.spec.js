/* eslint-env jest */
const indy = require('indy-sdk')
const { isUnknownLedger, registerLedger } = require('../../src/indy/indyclient')
const path = require('path')

describe('basic indy pool operations', () => {
  it('should be unknown ledger', async () => {
    let isRecognized = await isUnknownLedger('foobarfoobarfoobarfoobarfoobar123')
    expect(isRecognized).toBeTruthy()
  })

  it('should be unknown ledger', async () => {
    try {
      await indy.deletePoolLedgerConfig('abcdabcdabcd4bcdabcdabcd4bcdabcd')
    } catch (e) {}
    let isRecognized = await isUnknownLedger('abcdabcdabcd4bcdabcdabcd4bcdabcd')
    expect(isRecognized).toBeTruthy()
    const RESOURCE_DIR = path.resolve(__dirname, '../resource')
    let isRecognized2 = await registerLedger('abcdabcdabcd4bcdabcdabcd4bcdabcd', `${RESOURCE_DIR}/pool_transactions_builder_genesis`)
    expect(isRecognized2).toBeFalsy()
  })
})
