const logger = require('./logging/logger-main')
const { appConfig } = require('./config')
const express = require('express')
const next = require('next')
const apiclient = require('indyscan-api-client')
const isPortReachable = require('is-port-reachable');
const url = require('url');
const sleep = require('sleep-promise')

const { logRequests, logResponses } = require('./middleware')

function setupLoggingMiddlleware (app, enableRequestLogging, enableResponseLogging) {
  if (enableRequestLogging) {
    app.use(logRequests)
  }
  if (enableResponseLogging) {
    app.use(logResponses)
  }
}

async function startServer () {
  const app = next({ dev: process.env.NODE_ENV !== 'production' })
  const handle = app.getRequestHandler()

  const {INDYSCAN_API_URL} = appConfig
  let {hostname, port} = url.parse(INDYSCAN_API_URL)
  while ( false === await isPortReachable(port, {host: hostname})) {
    logger.info(`Can't reach Indyscan API '${INDYSCAN_API_URL}'.`)
    await sleep(1000)
  }

  app
    .prepare()
    .then(() => {
      const server = express()
      setupLoggingMiddlleware(server, appConfig.LOG_HTTP_REQUESTS === 'true', appConfig.LOG_HTTP_RESPONSES === 'true')

      server.get('/', async (req, res) => {
        logger.info('GET /')
        const {id} = await apiclient.getDefaultNetwork(INDYSCAN_API_URL)
        res.redirect(`/home/${id}`)
      })

      server.get('/home', async (req, res) => {
        logger.info('GET /home')
        const {id} = await apiclient.getDefaultNetwork(INDYSCAN_API_URL)
        res.redirect(`/home/${id}`)
      })

      server.get('/version', (req, res) => {
        require('pkginfo')(module)
        return res.status(200).send({ version: module.exports.version })
      })

      server.get('/home/:network', (req, res) => {
        const mergedQuery = Object.assign({}, req.query, req.params)
        logger.debug(`Custom express routing handler: /home/:network\nmerged query: ${JSON.stringify(mergedQuery)}`)
        return app.render(req, res, '/home', mergedQuery)
      })

      server.get('/txs/:network/:ledger', (req, res) => {
        const mergedQuery = Object.assign({}, req.query, req.params)
        logger.debug(`Custom express routing handler: /txs/:network/:ledger\nmerged query: ${JSON.stringify(mergedQuery)}`)
        return app.render(req, res, '/txs', mergedQuery)
      })

      server.get('/tx/:network/:ledger/:seqNo', (req, res) => {
        const mergedQuery = Object.assign({}, req.query, req.params)
        logger.debug(`Custom express routing handler: /txs/:network/:ledger\nmerged query: ${JSON.stringify(mergedQuery)}`)
        return app.render(req, res, '/tx', mergedQuery)
      })

      server.get('*', (req, res) => {
        return handle(req, res)
      })

      server.listen(appConfig.PORT, err => {
        if (err) throw err
        logger.info(`> Ready on ${appConfig.PORT}`)
      })
    })
    .catch(ex => {
      logger.error(ex.stack)
      process.exit(1)
    })
}

startServer()
