const { createNetworkManager } = require('./networkManager')
const express = require('express')
const next = require('next')
const initApiTxs = require('./api/txs.js')
const initApiNetworks = require('./api/networks.js')
const { createLedgerStorageManager } = require('indyscan-storage')
const { loadV1Config, loadV2Config } = require('./config')

function loadConfig () {
  if (process.env.INDY_NETWORKS_V2) {
    return loadV2Config(process.env.INDY_NETWORKS_V2)
  } else if (process.env.INDY_NETWORKS) {
    return loadV1Config(process.env.INDY_NETWORKS)
  } else {
    throw Error(`Found no indy network configuration. Use INDY_NETWORKS and INDY_NETWORKS_V2 env variables to supply.`)
  }
}

const networkConfig = loadConfig()
const networkManager = createNetworkManager(networkConfig)

console.log(`Running indyscan webapp against following mongo databases: ${JSON.stringify(networkManager.getNetworkDbs())}`)
console.log(`Default network is id='${networkManager.getDefaultNetworkId()}'`)

const URL_MONGO = process.env.URL_MONGO || 'mongodb://localhost:27017'
console.log(`Connecting to Mongo URL: ${URL_MONGO}`)

const PORT = process.env.WEBAPP_PORT || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

async function startServer () {
  const ledgerStorageManager = await createLedgerStorageManager(URL_MONGO)
  for (const network of networkManager.getNetworkDbs()) {
    console.log(`Adding network '${network}' to ledger storage manager.`)
    await ledgerStorageManager.addIndyNetwork(network)
  }

  app
    .prepare()
    .then(() => {
      const server = express()
      const apiRouter = express.Router()
      initApiTxs(apiRouter, ledgerStorageManager, networkManager)
      initApiNetworks(apiRouter, networkManager)

      server.use('/api', apiRouter)

      server.get('/', (req, res) => {
        console.log(`ROOT URL: /`)
        res.redirect(`/home/${networkManager.getDefaultNetworkId()}`)
      })

      server.get('/home', (req, res) => {
        console.log(`ROOT URL: /`)
        res.redirect(`/home/${networkManager.getDefaultNetworkId()}`)
      })

      server.get('/home/:network', (req, res) => {
        const mergedQuery = Object.assign({}, req.query, req.params)
        console.log(`Custom express routing handler: /home/:network\nmerged query: ${JSON.stringify(mergedQuery)}`)
        return app.render(req, res, '/home', mergedQuery)
      })

      server.get('/txs/:network/:ledger', (req, res) => {
        const mergedQuery = Object.assign({}, req.query, req.params)
        console.log(`Custom express routing handler: /txs/:network/:ledger\nmerged query: ${JSON.stringify(mergedQuery)}`)
        return app.render(req, res, '/txs', mergedQuery)
      })

      server.get('/tx/:network/:ledger/:seqNo', (req, res) => {
        const mergedQuery = Object.assign({}, req.query, req.params)
        console.log(`Custom express routing handler: /txs/:network/:ledger\nmerged query: ${JSON.stringify(mergedQuery)}`)
        return app.render(req, res, '/tx', mergedQuery)
      })

      server.get('*', (req, res) => {
        return handle(req, res)
      })

      server.listen(PORT, err => {
        if (err) throw err
        console.log(`> Ready on ${PORT}`)
      })
    })
    .catch(ex => {
      console.error(ex.stack)
      process.exit(1)
    })
}

startServer()
