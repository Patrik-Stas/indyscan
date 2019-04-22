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
    name: 'bound1',
    alias: 'a',
    type: Number,
    description: 'First bound of the seq-no range'
  },
  {
    name: 'bound2',
    alias: 'b',
    type: Number,
    description: 'Second bound of the seq-no range'
  },
  {
    name: 'ledger',
    alias: 'l',
    type: String,
    description: 'Ledger domain/pool/config'
  },
  {
    name: 'filter',
    alias: 'f',
    type: String,
    description: 'Filter tx types',
    defaultValue: '[]'
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
  console.log('JSON.stringify(options)')
  console.log(JSON.stringify(options))
  const { url, network, ledger, bound1, bound2, filter } = options
  console.log(`filter .... ${filter}`)
  const filterTxs = JSON.parse(filter)
  const txs = await apiclient.getTransactions(url, network, ledger, bound1, bound2, filterTxs)
  console.log(JSON.stringify(txs, null, 2))
}

function areOptionsValid (options) {
  if (!options['url']) {
    console.error('Need to specify indyscan url')
    return false
  }
  if (!options['network']) {
    console.error('Need to specify network')
    return false
  }
  if (!options['bound1']) {
    console.error('Need to specify bound1')
    return false
  }
  if (!options['bound2']) {
    console.error('Need to specify bound2')
    return false
  }
  if (!options['ledger']) {
    console.error('Need to specify ledger')
    return false
  }
  return true
}

runScript(optionDefinitions, usage, areOptionsValid, run)
