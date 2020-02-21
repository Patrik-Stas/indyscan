/* eslint-env jest */
const { createProcessorNoop } = require('../../../src/processors/processor-noop')

let processor = createProcessorNoop({ id: 'noop-processorr', format: 'xyz' })

describe('noop processor testsuite', () => {
  it('should not modify any data that comes in and return copy of it', async () => {
    const tx = { foo: 'bar', baz: 'baz' }
    const { processedTx, format } = await processor.processTx(tx)
    expect(format).toBe('xyz')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(processedTx))
    expect(tx === processedTx).toBeFalsy()
  })
})
