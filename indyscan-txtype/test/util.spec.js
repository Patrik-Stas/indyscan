/* eslint-env jest */
require('jest')

const { getSchemaLedgerId, parseSchemaId } = require('../src/util')

describe('creating, fetching info and deleting connections', () => {
  it('should parse schema id into separate parts', async () => {
    const { schemaFrom, schemaName, schemaVersion } = parseSchemaId('V4SGRU86Z58d6TV7PBUe6f:2:TEST:1.0.0')
    expect(schemaFrom).toBe('V4SGRU86Z58d6TV7PBUe6f')
    expect(schemaName).toBe('TEST')
    expect(schemaVersion).toBe('1.0.0')
  })

  it('should generate schema ledger Id', async () => {
    const schemaLedgerId = getSchemaLedgerId('V4SGRU86Z58d6TV7PBUe6f', 'license', '1.0.0')
    expect(schemaLedgerId).toBe('V4SGRU86Z58d6TV7PBUe6f:2:license:1.0.0')
  })
})
