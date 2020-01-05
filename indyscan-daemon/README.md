# Indyscan Daemon
- scans ledger, sequentially queries ledger for transactions from the first one to the last
 available on the ledger

# Configuration : Environment variables
 `LOG_LEVEL`  - silly / debug / info / warn / error

`NETWORKS_CONFIG_PATH` - Absolute or scanner process pwd relative path to configuration file. 
Default: `./app-config/localhost.json`

# Configuration : Application Configuration file
This file specifies list of scanning tasks to do. Each task has name, can have certain options and must
specify source and target, Source is where the data is taken from. Target is where the read data is stored.

Only `ledger` source is currently supported and only `elasticsearch` is supported target. 

```$json
[
  {
    "name": "localhost-indy",
    "options": {
      "speed_preset": "FAST"
    },
    "source": {
      "type": "ledger",
      "data": {
        "name": "LOCALHOST_INDYSCAN",
        "genesis": "./genesis/LOCALHOST_INDYSCAN.txn"
      }
    },
    "target": {
      "type": "elasticsearch",
      "data": {
        "url": "http://localhost:9200",
        "index": "txs-localhost-indy",
        "replicas": 0
      }
    }
  }
]
```

- This sample config file says the daemon should scan 1 network with given `name` of `localhost-indy`.
 This is a name only in the context of the scanner. You can pick any name and change it freely later in time.
- The `scanning` object defined how should the `scanning` be performed. Right now only 1 option `mode` is 
available. These are allowed mode values: `SLOW`, `MEDIUM`, `FAST`, `TURBO`
- The `source` object defines what's the source of transactions. Currently only `type` of `ledger` is supported.
The `source.data` specifies data source details for given `source.type`. For `source.type: ledger`, the 
`source.data` must specify `name`. If ledger with given `name` exists in `~/.indy-client/pool/`, the 
`genesis` option will be ignored. If no ledger with given `name` exists in `~/.indy-client/pool/`, the 
`genesis` value will be utilized. The `genesis` value must be path pointing to indy network genesis file
which will be from then on used for connecting to ledger identtified as `name` (it will be
added to `~/.indy-client/pool/` ). The path must be relative to path of the configuration file itself.
