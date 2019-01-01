const express = require("express");
const next = require("next");
const assert = require('assert');
const createRouter = require("./express/index.js");
const storage = require ('indyscan-storage');

const indyNetworks = ['SOVRIN_MAINNET', 'SOVRIN_TESTNET'];
const url = 'mongodb://localhost:27017';

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
                res.redirect('/home/SOVRIN_MAINNET');
                // return app.render(req, res, '/home/SOVRIN_MAINNET');
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
    storage.init(url, indyNetworks, async (storageManager, err) => {
        assert.equal(null, err);
        startServer(storageManager)
    }) ;
}

run();
