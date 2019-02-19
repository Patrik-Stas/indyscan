const express = require("express");
const next = require("next");
const assert = require('assert');
const createRouter = require("./express/index.js");
const storage = require ('indyscan-storage');
const {getIndyNetworks, getDefaultNetwork} = require('./networks');

console.log(`Running indyscan webapp against following mongo databases: ${JSON.stringify(getIndyNetworks())}`);
console.log(`Default database is ${getDefaultNetwork()}`);

const mongoUrl = process.env.URL_MONGO || 'mongodb://localhost:27017';
console.log(`Connecting to Mongo URL: ${mongoUrl}`);

const PORT = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

async function startServer(storageManager) {
    app
        .prepare()
        .then(() => {
            const server = express();
            const apiRouter = createRouter(storageManager);

            server.use("/api", apiRouter);

            server.get('/', (req, res) => {
                console.log(`ROOT URL: /`);
                res.redirect(`/home/${getDefaultNetwork()}`);
            });

            server.get('/home', (req, res) => {
                console.log(`ROOT URL: /`);
                res.redirect(`/home/${getDefaultNetwork()}`);
            });

            server.get('/home/:network', (req, res) => {
                const mergedQuery = Object.assign({}, req.query, req.params);
                console.log(`Custom express routing handler: /home/:network\nmerged query: ${JSON.stringify(mergedQuery)}`);
                return app.render(req, res, '/home', mergedQuery);
            });

            server.get('/txs/:network/:txType', (req, res) => {
                const mergedQuery = Object.assign({}, req.query, req.params);
                console.log(`Custom express routing handler: /txs/:network/:type\nmerged query: ${JSON.stringify(mergedQuery)}`);
                return app.render(req, res, '/txs', mergedQuery);
            });

            server.get('/tx/:network/:txType/:seqNo', (req, res) => {
                const mergedQuery = Object.assign({}, req.query, req.params);
                console.log(`Custom express routing handler: /txs/:network/:type\nmerged query: ${JSON.stringify(mergedQuery)}`);
                return app.render(req, res, '/tx', mergedQuery);
            });

            server.get("*", (req, res) => {
                return handle(req, res);
            });

            server.listen(PORT, err => {
                if (err) throw err;
                console.log(`> Ready on ${PORT}`);
            });
        })
        .catch(ex => {
            console.error(ex.stack);
            process.exit(1);
        });
}

async function run() {
    storage.init(mongoUrl, getIndyNetworks(), async (storageManager, err) => {
        assert.equal(null, err);
        startServer(storageManager)
    }) ;
}

run();
