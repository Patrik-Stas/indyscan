/* eslint-env jest */

// const createTxResolverWithError = () => {
//   let errCount = 0
//
//   return async function txResolverWithError (subledger, seqNo) {
//     return new Promise(function (resolve, reject) {
//       if (errCount === 0 && seqNo === 2) {
//         errCount++
//         reject(Error(`Simulated transaction resolution error. ErrCount:${errCount}`))
//       } else {
//         resolve({
//           network,
//           subledger,
//           txnMetadata: { seqNo }
//         })
//       }
//     })
//   }
// }

const {createPipelineSequential} = require('../../../src/pipelines/pipeline-sequential')
const {createProcessorNoop} = require('../../../src/processors/processor-noop')
const {createTargetMemory} = require('../../../src/targets/target-memory')
const {createIteratorGuided} = require('../../../src/iterators/iterator-guided')
const {createSourceMemory} = require('../../../src/sources/source-memory')
const sleep = require('sleep-promise')

const TX_FORMAT_IN = 'format-foo'
const TX_FORMAT_OUT = 'format-bar'

let dataspace1 = {
  'domain': {
    '1': {[TX_FORMAT_IN]: {'foo': 'foo-data1'}, 'format-bar': {'bar': 'bar-data1'}},
    '2': {[TX_FORMAT_IN]: {'foo': 'foo-data2'}},
    '3': {[TX_FORMAT_IN]: {'foo': 'foo-data3'}, 'format-bar': {'bar': 'bar-data3'}},
    '4': {[TX_FORMAT_IN]: {'foo': 'foo-data4'}}
  },
  'pool': {
    '1': {[TX_FORMAT_IN]: {'pool': 'pooldata'}}
  },
  'config': {
    '1': {'format-config': {'config': 'configdata'}}
  }
}

let dataspace2 = {
  domain: {},
  pool: {},
  config: {}
}

let sourceLedgerSim = createSourceMemory({id: 'ledger-source-simulation', dataspace: dataspace1})
let sourceDbSim = createSourceMemory({id: 'db-source-simulation', dataspace: dataspace2})
let targetDbSim = createTargetMemory({id: 'db-target-simulation', dataspace: dataspace2})
let noopProcessor = createProcessorNoop({id: 'noop-processorr', format: TX_FORMAT_OUT})

describe('ledger tx resolution', () => {
  beforeAll(async () => {
    jest.setTimeout(1000 * 60)
  })

  it('should store 4 transactions', async () => {
    const sequentialConsumerConfig = {
      timeoutOnSuccess: 300,
      timeoutOnTxIngestionError: 6000,
      timeoutOnLedgerResolutionError: 6000,
      timeoutOnTxNoFound: 6000,
      jitterRatio: 0
    }
    let iteratorGuided = createIteratorGuided({
      id: 'test-iterator',
      source: sourceLedgerSim,
      sourceSeqNoGuidance: sourceDbSim
    })
    let pipeline = createPipelineSequential({
      id: 'test-domain',
      subledger: 'domain',
      iterator: iteratorGuided,
      requestTxFormat: TX_FORMAT_IN,
      processor: noopProcessor,
      target: targetDbSim,
      timing: sequentialConsumerConfig
    })
    pipeline.start()
    await sleep(1000)
    pipeline.stop()

    let txData1 = await sourceDbSim.getTxData('domain', 1, TX_FORMAT_OUT)
    expect(txData1['foo']).toBe('foo-data1')

    let txData2 = await sourceDbSim.getTxData('domain', 2, TX_FORMAT_OUT)
    expect(txData2['foo']).toBe('foo-data2')

    let txData3 = await sourceDbSim.getTxData('domain', 3, TX_FORMAT_OUT)
    expect(txData3['foo']).toBe('foo-data3')

    let txData4 = await sourceDbSim.getTxData('domain', 4, TX_FORMAT_OUT)
    expect(txData4['foo']).toBe('foo-data4')

    let txData5 = await sourceDbSim.getTxData('domain', 5, TX_FORMAT_OUT)
    expect(txData5).toBeUndefined()

    let txData1WrongFormat = await sourceDbSim.getTxData('domain', 1, TX_FORMAT_IN)
    expect(txData1WrongFormat).toBeUndefined()
  })
  //
  // it('should timeout and only store 2 transactions', async () => {
  //   const timerConfig = {
  //     timeoutOnSuccess: 300,
  //     timeoutOnTxIngestionError: 500,
  //     timeoutOnLedgerResolutionError: 500,
  //     timeoutOnTxNoFound: 1000,
  //     jitterRatio: 0
  //   }
  //   const txResolveWithError = createTxResolverWithError()
  //   consumer = createConsumerSequential(txResolveWithError, storageRead, storageWrite, network, 'domain', timerConfig)
  //   consumer.start()
  //   await sleep(1000)
  //   consumer.stop()
  //   expect(await storageRead.getTxCount()).toBe(2)
  // })

})
