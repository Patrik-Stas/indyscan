/* eslint-env jest */
require('jest')
const { buildWorkersQuery } = require('../../src/query-builder')
const { daemonClient, daemonQueryBuilder } = require('../../src')
const { loadEnvVariables } = require('./config-loader')

loadEnvVariables()

beforeAll(async () => {
  jest.setTimeout(1000 * 5)
})

describe('basic api test suite', () => {
  it('should get all workers', async () => {
    let workers = await daemonClient.getWorkers(process.env.API_URL)
    expect(workers.length).toBeGreaterThan(3)
  })

  it('should get one worker', async () => {
    let workers = await daemonClient.getWorkers(process.env.API_URL)
    expect(workers.length).toBeGreaterThan(0)
    const worker0 = workers[0]
    const workerById = await daemonClient.getWorker(process.env.API_URL, worker0.componentId)
    expect(workerById.componentId).toBe(worker0.componentId)
  })

  it('should get specific workers by ids', async () => {
    let workers = await daemonClient.getWorkers(process.env.API_URL)
    expect(workers.length).toBeGreaterThan(3)
    const workerId0 = workers[0].componentId
    const workerId2 = workers[2].componentId
    let workersFiltered = await daemonClient.getWorkers(process.env.API_URL, daemonQueryBuilder.buildWorkersQuery(undefined, undefined, undefined, [workerId0, workerId2]))
    expect(workersFiltered.length).toBe(2)
    expect(workersFiltered[0].componentId).toBe(workerId0)
    expect(workersFiltered[1].componentId).toBe(workerId2)
  })

  it('should get workers by operation type', async () => {
    let workers = await daemonClient.getWorkers(process.env.API_URL, daemonQueryBuilder.buildWorkersQuery('expansion'))
    expect(workers.length).toBeGreaterThan(0)
    const other = workers.find(worker => worker.operationType !== 'expansion')
    expect(other).toBeUndefined()
  })

  it('should get workers by subledger', async () => {
    let workers = await daemonClient.getWorkers(process.env.API_URL, daemonQueryBuilder.buildWorkersQuery(undefined,  'domain', undefined, undefined))
    expect(workers.length).toBeGreaterThan(0)
    const other = workers.find(worker => worker.subledger !== 'domain')
    expect(other).toBeUndefined()
  })

  it('should get workers by target es index', async () => {
    let workers = await daemonClient.getWorkers(process.env.API_URL, daemonQueryBuilder.buildWorkersQuery(undefined, undefined,'txs-sovmain'))
    expect(workers.length).toBeGreaterThan(0)
    expect(workers.find(worker => worker.iteratorInfo.sourceInfo.implementation === 'elasticsearch')).toBeDefined()
    const others = workers.find(worker => worker.iteratorInfo.sourceInfo.implementation === 'elasticsearch'
      && worker.iteratorInfo.sourceInfo.esIndex !== 'txs-sovmain')
    expect(others).toBeUndefined()
  })
})
