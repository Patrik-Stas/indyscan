const createHistogram = require("../../services/timeseries");
const queryString  = require('query-string');
const url = require('url');

const express = require("express");

function createRouter(storageDomain, storagePool, storageConfig ) {
    const router = express.Router();

    router.get("/tx-domain", async (req, res) => {
        const txs = await storageDomain.getTxRange(0,10);
        res.status(200).send({txs})
    });

    router.get("/tx-config", async (req, res) => {
        const parts = url.parse(req.url, true);
        console.log(`${JSON.stringify(parts)}`);
        const fromRecentTx = parseInt(parts.query.fromRecentTx);
        const toRecentTx = parseInt(parts.query.toRecentTx);
        const network = parseInt(parts.query.network);
        console.log(`GET ${req.url}`);
        console.log(`Requesting transactions from ${fromRecentTx} to ${toRecentTx}.`)
        if (!(fromRecentTx>=0 && toRecentTx>=0 && toRecentTx-fromRecentTx<150 && toRecentTx-fromRecentTx>0)) {
            console.log(`Query string failed validation checks.`)
            res.status(400).send({message:"i don't like your query string"});
            return
        }
        const txs = await storageConfig.getTxRange(fromRecentTx, toRecentTx);
        res.status(200).send({txs})
    });

    router.get("/tx-pool", async (req, res) => {
        const txs = await storagePool.getTxRange(0,10);
        res.status(200).send({txs})
    });

    const oneDayInMiliseconds = 1000*60*60*24;

    router.get("/tx-domain/timeseries", async (req, res) => {
        const timestamps = await storageDomain.getAllTimestamps();
        const histogram = await createHistogram(timestamps, oneDayInMiliseconds);
        res.status(200).send({histogram})
    });


    router.get("/tx-pool/timeseries", async (req, res) => {
        const timestamps = await storagePool.getAllTimestamps();
        const histogram = await createHistogram(timestamps, oneDayInMiliseconds);
        res.status(200).send({histogram})
    });


    router.get("/tx-config/timeseries", async (req, res) => {
        const timestamps = await storageConfig.getAllTimestamps();
        const histogram = await createHistogram(timestamps, oneDayInMiliseconds);
        res.status(200).send({histogram})
    });

    return router
}

module.exports = createRouter;
