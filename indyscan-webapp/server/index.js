const logger = require('./logging/logger-main')
const { appConfig } = require('./config')
const express = require('express')
const next = require('next')
const proxy = require('http-proxy-middleware')
const { getDefaultNetwork } = require('indyscan-api-client')
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

  app
    .prepare()
    .then(() => {
      const server = express()
      setupLoggingMiddlleware(server, appConfig.LOG_HTTP_REQUESTS === 'true', appConfig.LOG_HTTP_RESPONSES === 'true')

      server.get('/', async (req, res) => {
        logger.info('GET /')
        let defaultNetwork
        try {
          defaultNetwork = await getDefaultNetwork(appConfig.INDYSCAN_API_URL)
        } catch (err) {
          return res.redirect(`/pending`)
        }
        return (defaultNetwork) ? res.redirect(`/home/${defaultNetwork.id}`) : res.redirect(`/pending`)
      })

      server.get('/home', async (req, res) => {
        res.redirect(`lo`)
      })

      server.get('/version', (req, res) => {
        require('pkginfo')(module)
        return res.status(200).send({ version: module.exports.version })
      })

      server.get('/home/:network', (req, res) => {
        const mergedQuery = Object.assign({}, req.query, req.params)
        logger.info(`Custom express routing handler: /home/:network\nmerged query: ${JSON.stringify(mergedQuery)}`)
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

      server.use(
        '/api',
        proxy({ target: appConfig.INDYSCAN_API_URL, changeOrigin: true })
      )


      server.use(
        '/socket.io',
        proxy({ target: appConfig.DAEMON_WS_URL, ws: true, changeOrigin: true })
      )

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
