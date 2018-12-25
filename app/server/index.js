const express = require("express");
const next = require("next");
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const createRouter = require("./routes/index.js");
const createStorage = require ('indyscan-storage');


const PORT = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const dbName = 'SOVRIN_MAINNET';

// Connection URL
const url = 'mongodb://localhost:27017';

MongoClient.connect(url, async function (err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to Mongo.");
    const db = client.db(dbName);
    const storage = await createStorage(db);
    startServer(storage)
});


async function startServer(storage) {

    app
        .prepare()
        .then(() => {
            const server = express();
            const apiRouter = createRouter(storage);

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