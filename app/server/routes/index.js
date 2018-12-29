const createHistogram = require("../../services/timeseries");

const express = require("express");

function createRouter(storageDomain, storagePool, storageConfig ) {
    const router = express.Router();

    router.get("/tx-domain", async (req, res) => {
        const txs = await storageDomain.getTxRange(0,10);
        res.status(200).send({txs})
    });

    router.get("/tx-config", async (req, res) => {
        const txs = await storageConfig.getTxRange(0,10);
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
