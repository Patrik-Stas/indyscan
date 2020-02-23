/* eslint-env jest */
const { createTransformerSerializer } = require('../../../src/transformers/transformer-serializer')

let processor = createTransformerSerializer({ id: 'noop-processor' })

describe('noop processor testsuite', () => {
  it('should not modify any data that comes in and return copy of it', async () => {
    const tx = { foo: 'bar', baz: 'baz' }
    const { processedTx, format } = await processor.processTx(tx)
    expect(format).toBe('original')
    expect(JSON.stringify(processedTx)).toBe(JSON.stringify({ serialized: JSON.stringify(tx) }))
    expect(tx === processedTx).toBeFalsy()
  })
})
