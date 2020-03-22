const { asyncHandler } = require('../middleware')

function assureArray(value) {
  return Array.isArray(value) ? value : [value]
}

function apiWorkersQueryToServiceQuery(requestQuery) {
  const {filterIds, filterOperationTypes, filterSubledgers, filterTargetEsIndices} = requestQuery
  let workerQuery = {}
  if (filterIds) {
    workerQuery.workerIds = assureArray(filterIds)
  }
  if (filterOperationTypes) {
    workerQuery.operationTypes = assureArray(filterOperationTypes)
  }
  if (filterSubledgers) {
    workerQuery.subledgers = assureArray(filterSubledgers)
  }
  if (filterTargetEsIndices) {
    workerQuery.targetEsIndices = assureArray(filterTargetEsIndices)
  }
  return workerQuery
}

module.exports = function (app, serviceWorkers) {
  app.get('/api/workers',
    asyncHandler(async function (req, res) {
      const serviceWorkersQuery = apiWorkersQueryToServiceQuery(req.query)
      const workersInfo = await serviceWorkers.getWorkersInfo(serviceWorkersQuery)
      res.status(200).send(workersInfo)
    })
  )

  app.post('/api/workers',
    asyncHandler(async function (req, res) {
      const serviceWorkersQuery = apiWorkersQueryToServiceQuery(req.query)
      if (req.query.flipState === 'true') {
        serviceWorkers.flipWorkersState(serviceWorkersQuery)
      } else {
        if (req.query.enabled === undefined) {
          return res.status(400).send()
        }
        if (req.query.enabled === 'true') {
          serviceWorkers.enableWorkers(serviceWorkersQuery)
        } else {
          serviceWorkers.disableWorkers(serviceWorkersQuery)
        }
      }
      const workersInfo = await serviceWorkers.getWorkersInfo()
      res.status(200).send(workersInfo)
    })
  )
}
