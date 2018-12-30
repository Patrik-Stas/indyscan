const express = require("express");
const next = require("next");
const assert = require('assert');
const createRouter = require("./routes/index.js");
const storage = require ('indyscan-storage');

const dbName = 'SOVRIN_MAINNET';
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
    storage.init(url, [dbName], async (storageManager, err) => {
        assert.equal(null, err);
        startServer(storageManager)
    }) ;
}

run();
