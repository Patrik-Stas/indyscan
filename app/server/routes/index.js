const createHistogram = require("../../services/timeseries");

const express = require("express");

function createRouter(storage) {
    const router = express.Router();

    router.get("/tx-domain", async (req, res) => {
        const txs = await storage.getTxRange(0,10);
        res.status(200).send({txs})
    });

    router.get("/timeseries", async (req, res) => {
        const timestamps = await storage.getAllTimestamps();
        const intervalSec = 1000*60*60*24;
        const histogram = await createHistogram(timestamps, intervalSec);
        res.status(200).send({histogram})
    });

    return router
}

module.exports = createRouter;
