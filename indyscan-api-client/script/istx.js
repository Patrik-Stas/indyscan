#!/usr/bin/env node

const { runScript } = require('./script-comon')
const apiclient = require('../src/index')

const optionDefinitions = [
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'Display this usage guide.'
  },
  {
    name: 'url',
    type: String,
    description: 'Target Indyscan URL'
  },
  {
    name: 'network',
    type: String,
    description: 'Network name as known at specified indyscan instance'
  },
  {
    name: 'ledger',
    alias: 'l',
    type: String,
    description: 'Ledger domain/pool/config'
  },
  {
    name: 'seqno',
    alias: 's',
    type: Number,
    description: 'Sequence number of the transaction'
  }
]

const usage = [
  {
    header: 'Typical Example',
    content: 'A simple example demonstrating typical usage.'
  },
  {
    header: 'Options',
    optionList: optionDefinitions
  },
  {
    content: 'Project home: {underline https://github.com/Patrik-Stas/indy-wallet-watch}'
  }
]

async function run (options) {
  const { url, network, ledger, seqno } = options
  const txs = await apiclient.getTx(url, network, ledger, seqno)
  console.log(JSON.stringify(txs, null, 2))
}

function areOptionsValid (options) {
  if (!options.url) {
    console.error('Need to specify indyscan url')
    return false
  }
  if (!options.network) {
    console.error('Need to specify network')
    return false
  }
  if (!options.ledger) {
    console.error('Need to specify ledger')
    return false
  }
  if (!options.seqno) {
    console.error('Need to specify bound2')
    return false
  }
  return true
}

runScript(optionDefinitions, usage, areOptionsValid, run)
