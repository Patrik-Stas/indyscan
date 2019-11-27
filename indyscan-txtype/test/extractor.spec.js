/* eslint-env jest */
const { txSchema } = require('./resource/txs')
const { extractSchemaTxInfo } = require('../src/extractor')

describe('basic suite', () => {
  it('should extract info from schema transaction', async () => {
    let {txnSeqno, txnTime, schemaId, schemaFrom, schemaName, schemaVersion, attributes} = extractSchemaTxInfo(txSchema)
    expect(txnSeqno).toBe(386)
    expect(txnTime).toBe(1574776370)
    expect(schemaId).toBe('KuXsPLZAsxgjbaAeQd4rr8:2:SeLFSchemaAries4:1.1')
    expect(schemaFrom).toBe('KuXsPLZAsxgjbaAeQd4rr8')
    expect(schemaName).toBe('SeLFSchemaAries4')
    expect(schemaVersion).toBe('1.1')
    expect(attributes.length).toBe(2)
    expect(attributes).toContain('position')
    expect(attributes).toContain('userID')
  })
})
