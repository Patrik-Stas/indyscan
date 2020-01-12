# Indyscan Daemon
- scans ledger, sequentially queries ledger for transactions from the first one to the last
 available on the ledger

# Configuration : Environment variables
 `LOG_LEVEL`  - silly / debug / info / warn / error

`NETWORKS_CONFIG_PATH` - Absolute or scanner process pwd relative path to configuration file. 
Default: `./app-config/localhost.json`

# Configuration 4.0.0+
In version 4.0.0 was introduced new configuration format for daemon. This daemon is very explicit and much
more verbose than older format, but also much more expressive and flexible. The configuration format in 4.0.0
basically gives instructions to a small custom dependency inject engine how to build out various object and
how to inject these into dependent objects. 

The daemon recognizes several basic interfaces:
### Source interface
Defined as:
```
async getTx(subledger, seqNo, format=original)
getSupportedFormats()
```
- The `getTx` returns a transaction for some network, specified by seqNo within a subledgeer. 
The returned transaction is returned specified format. If no format is specified, 'original' format is used,
representing the format of transactions as returned from the ledger.
Different implementations of this interface might return from different sources - ledger, files, databases, etc.

 
#### Source interface implementation: Ledger
Returns transactions from ledger for specific Indy network and its particular subledger. 
Constructor requires following arguments
```json
{
    "id": "source.sovmain",
    "name": "SOVRIN_MAINNET",
    "genesisReference": "./genesis/SOVRIN_MAINNET.txn"
}
```

#### Source interface implementation: Elasticsearch 
Returns transactions from ES for specific Indy network and its particular subledger. 
Constructor requires following arguments
```json
{
    "id": "source.target.sovmain",
    "url": "https://localhost:9200",
    "indexDomain": "txs-sovmain-domain",
    "indexPool": "txs-sovmain-pool",
    "indexConfig": "txs-sovmain-config"
}
```

### Target interface
Defined as single function
```
async addTxData(subledger, seqNo, data)
```
which stores or sends data associated with a transaction to some datastore or destination.
#### Target interface implementation: Elasticsearch
TODO: add text here

### Iterator interface 
Defined as single function
```
async getTx(subledger, format=original) -> 
```
which eventually returns some transaction for processing.

### Processor interface
Defined as single function
```
async process(tx) -> transformed
```
which takes a transaction as parameter and returns some sort of mapped data.


### Pipeline inteface

```
start()
stop()
info()
```


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


# sources (core)


# destinations (core)

# processor

-------
+ source (lookups)

# iterator

-------
+ source (txs)
+ source (guidance)

#pipeline
------
+ iterator
+ processor
+ destination


let src = daemonFactory.getSource(id)
let iterator = daemonFactory.getIter(idIter)


- each entity will have its ID
- entities are resolvable by ID
- certain conventions will be in place - you can declare source and it will be convention to postifx it with name of subledger
- the config author need to assure injected objects have correct interface / make sense to combine
- constructions order:
1. sources
2. destinations
3. transformations
4. iterators
5. pipelines
