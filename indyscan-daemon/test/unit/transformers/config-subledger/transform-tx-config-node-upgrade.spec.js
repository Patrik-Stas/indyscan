/* eslint-env jest */
const { createTransformerOriginal2Expansion } = require('../../../../src/transformers/transformer-original2expansion')
const txNodeUpgrade = require('indyscan-storage/test/resource/sample-txs/tx-config-node-upgrade')
const _ = require('lodash')

const processor = createTransformerOriginal2Expansion({ sourceLookups: undefined })

describe('config/node-upgrade transaction transformations', () => {
  it('should andd typeName and subledger for config NODE_UPGRADE transaction', async () => {
    const tx = _.cloneDeep(txNodeUpgrade)
    const { processedTx } = await processor.processTx(tx, 'CONFIG')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txNodeUpgrade)) // check passed tx was not modified
    expect(processedTx.txn.typeName).toBe('NODE_UPGRADE')
    expect(processedTx.txnMetadata.txnTime).toBe('2019-11-11T17:06:31.000Z')
  })
})
