/* eslint-env jest */
require('jest')
const { getWorkers } = require('../../src')
const { loadEnvVariables } = require('./config-loader')

loadEnvVariables()

beforeAll(async () => {
  jest.setTimeout(1000 * 5)
})

describe('basic api test suite', () => {

  it('should get all workers', async () => {
    let workers = await getWorkers(process.env.API_URL)
    expect(workers.length).toBeGreaterThan(0)
  })


  it('should get workers by operation type', async () => {
    let workers = await getWorkers(process.env.API_URL, 'expansion')
    expect(workers.length).toBeGreaterThan(0)
    const other = workers.find(worker => worker.operationType !== 'expansion')
    expect(other).toBeUndefined()
  })

  it('should get workers by subledger', async () => {
    let workers = await getWorkers(process.env.API_URL, undefined, 'domain')
    expect(workers.length).toBeGreaterThan(0)
    const other = workers.find(worker => worker.subledger !== 'domain')
    expect(other).toBeUndefined()
  })

  it('should get workers by target es index', async () => {
    let workers = await getWorkers(process.env.API_URL, undefined, undefined, 'txs-sovmain')
    expect(workers.length).toBeGreaterThan(0)
    expect(workers.find(worker => worker.iteratorInfo.sourceInfo.implementation === 'elasticsearch')).toBeDefined()
    const others = workers.find(worker => worker.iteratorInfo.sourceInfo.implementation === 'elasticsearch'
      && worker.iteratorInfo.sourceInfo.esIndex !== 'txs-sovmain')
    expect(others).toBeUndefined()
  })
})
