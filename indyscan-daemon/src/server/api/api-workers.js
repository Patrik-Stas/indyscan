const { asyncHandler } = require('../middleware')

module.exports = function (app, serviceWorkers) {
  app.get('/api/workers',
    asyncHandler(async function (req, res) {
      const workersInfo = await serviceWorkers.getAllWorkersInfo()
      res.status(200).send(workersInfo)
    }))
}
