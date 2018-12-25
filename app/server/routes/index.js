const express = require("express");

function createRouter(storage) {
    const router = express.Router();

    router.get("/movies", async (req, res) => {
        const txs = await storage.getTxRange(0,10);
        res.status(200).send({txs: txs})
    });

    return router
}

module.exports = createRouter;
