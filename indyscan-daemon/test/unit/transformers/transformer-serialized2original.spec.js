/* eslint-env jest */
const { createTransformerSerialized2Original } = require('../../../src/transformers/transformer-serialized2original')
const { createTransformerOriginal2Serialized } = require('../../../src/transformers/transformer-original2serialized')

let serialized2Original = createTransformerSerialized2Original({ id: 'foo' })
let original2Serialized = createTransformerOriginal2Serialized({ id: 'noop-processor' })

describe('noop processor testsuite', () => {
  it('should not modify any data that comes in and return copy of it', async () => {
    const tx = {json:"{\"foo\":\"bar\",\"baz\":\"baz\"}"}
    const { processedTx, format } = await serialized2Original.processTx(tx)
    expect(format).toBe('original')
    expect(processedTx.foo).toBe('bar')
    expect(processedTx.baz).toBe('baz')
  })

  it('should serialize and deserialize back using transforms', async () => {
    const tx = { foo: 'bar', baz: 'baz' }
    const { processedTx: txSerialized, format: formatSerialized } = await original2Serialized.processTx(tx)
    expect(formatSerialized).toBe('serialized')
    const { processedTx: txOriginal, format: formatOriginal } = await serialized2Original.processTx(txSerialized)
    expect(formatOriginal).toBe('original')
    expect(tx.foo).toBe(txOriginal.foo)
    expect(tx.baz).toBe(txOriginal.baz)
  })
})
