const createHistogram = require('../../services/timeseries')
const queryString = require('query-string')
const url = require('url')
const express = require('express')
const indyStorage = require('indyscan-storage')
const { getIndyNetworks, getDefaultNetwork } = require('../networks')

function initNetworksApi (router) {
  router.get('/networks', async (req, res) => {
    console.log(`HIT /networks`)
    const networks = getIndyNetworks()
    const defaultNetwork = getDefaultNetwork()
    res.status(200).send({ networks, defaultNetwork })
  })
}

module.exports = initNetworksApi
