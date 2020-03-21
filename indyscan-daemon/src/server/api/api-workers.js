const { asyncHandler } = require('../middleware')

module.exports = function (app, serviceWorkers) {
  app.get('/api/workers',
    asyncHandler(async function (req, res) {
      const workersInfo = await serviceWorkers.getAllWorkersInfo()
      res.status(200).send(workersInfo)
    })
  )

  app.post('/api/workers/:id',
    asyncHandler(async function (req, res) {
      const { id } = req.params
      if (req.query.flipState === 'true') {
        serviceWorkers.flipStateOne(id)
      } else {
        return res.status(400).send()
      }
      res.status(200).send({ ok: 'ok' })
    })
  )

  app.post('/api/workers',
    asyncHandler(async function (req, res) {
      const enabled = req.query.enabled === 'true'
      if (enabled) {
        serviceWorkers.enableAll()
      } else {
        serviceWorkers.disableAll()
      }
      const workersInfo = await serviceWorkers.getAllWorkersInfo()
      res.status(200).send(workersInfo)
    })
  )
}
