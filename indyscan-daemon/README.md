# Indyscan Daemon
- scans ledger, sequentially queries ledger for transactions from the first one to the last
 available on the ledger

# Configuration : Environment variables
 `LOG_LEVEL`  - silly / debug / info / warn / error

`NETWORKS_CONFIG_PATH` - Absolute or scanner process pwd relative path to configuration file. 
Default: `./app-config/localhost.json`

# Configuration 4.0.0+
In version 4.0.0 was introduced new configuration format for daemon. This daemon is 
more verbose than the older format, but also more expressive and flexible.

## Configuration file evaluation
Configuration file contains 3 main sections: `environment`, `comments` and `objects`.
- Section `environment` is object containing key-values. The `objects` section can contain references to the keys 
  defined here in order to access the values behind them.
- Section `comments` is ignored.
- Section `objects` defined how should be application objects composed at runtime.


## `Objects` section
There are 5 types of interfaces which can be wired up together. Each interface can have various implementations you 
can pick.
Interfaces:
- `source`, implementations: [`soure-ledger`, `source-elasticsearch`]
- `target`, implementations: [`target-elasticsearch`]
- `processor`, implementations: [`processor-expansion`]
- `iterator`, implementations: [`iterator-guided`]
- `pipeline`, implementations: [`pipeline-sequential`]

### `source` interface
Defined as:
```
async getTxData(subledger, seqNo, format=original)
async getHighestSeqno(subledger)
getSupportedFormats()
```
- Source is interface to request a transaction for some network. Returns transaction in specified format if the 
transactions exists, no errors occurred and the source implementations supports specified format. If format is not
specified, `original` format is used as default. The `original` format should match format equivalent to how 
transactions are returned from the ledger.
 
- If no errors occurred but transaction for given subledger does not exists
(for example requesting transaction seqNo=1000 from domain subledger while only 900 transactions currently exists
 on that subledger), the function returns `undefined`.

- If input is invalid (non-existing ledger, unsupported format, integer non-inferable data)

- Different implementations of this interface might return from different data sources - ledger, files, databases, etc.

 
#### `source` interface implementation: `source-ledger`
Returns transactions directly querying the ledger on demand. 
Constructor requires following arguments:
```json
{
    "id": "source.sovmain",
    "networkName": "SOVRIN_MAINNET",
    "networkGenesisPath": "/home/ubuntu/SOVRIN_MAINNET.txn"
}
```
- If ledger already exists on the host system identified as `networkName`, its genesis file will be the one
 used for connecting to Indy network and value of `networkGenesisPath` will be ignored.
- If ledger `netoworkName` is unknown to the host system, it will be created using file `networkGenesisPath`.
  The path can be absolute or relative to the PWD of the running process. To make things easier, there's a special
  macro `"$CFGDIR"` which will be evaluated as a path to directory containing the processed configuration file. 
  This is useful, because you  can put genesis files into a subdirectory of your config file and reference them. 
  Example of using this: `"networkGenesisPath": "$CFGDIR/genesis/SOVRIN_MAINNET.txn"`.

#### `source` interface implementation: `source-elasticsearch` 
Returns transactions stored in Elasticsearch. Supports `original` and `expanded` formats. The `expanded` format
is result of processing a transaction via `expansion` processor.

Constructor requires following arguments:
```json
{
    "id": "source.target.sovmain",
    "url": "https://localhost:9200",
    "indexDomain": "txs-sovmain-domain",
    "indexPool": "txs-sovmain-pool",
    "indexConfig": "txs-sovmain-config"
}
```

### `target` interface
Defined as single function
```
async addTxData(subledger, seqNo, data)
```
which stores or sends data associated with a particular network transaction to some datastore or destination.

#### `target` interface implementation: `target-elasticsearch`
Stores data in elasticsearch.

Constructor requires following arguments:
```json
{
    "id": "target.sovmain",
    "url": "https://localhost:9200",
    "indexDomain": "txs-sovmain-domain",
    "indexPool": "txs-sovmain-pool",
    "indexConfig": "txs-sovmain-config"
}
```

### `iterator` interface 
Defined as single function
```
async getNextTx(subledger, format=original) -> 
```
which returns some transaction of specified subledger. 

#### `iterator` interface implementation: `iterator-guided`
Constructor requires following arguments:
```json
{
    "id": "iterator.sovmain",
    "source": "source.sovmain",
    "sourceSeqNoGuidance": "source.target.sovmain"
}
```
Returns transaction data from specified subledger, in specified format from `source`, whereas the seqNo is
determined as `sourceSeqNoGuidance.getHighestSeqno(subledger) + 1`.

### `processor` interface
Performs certain data transformation on passed transaction. The processor implementations specify what format
`txData` should be of.
```
async processTx(txData) -> {processedTx, format}}
```

#### `processor` interface implementation: `processor-expansion`
Expects to be passed transaction in `original` format. Returns copy of data received, but possibly with additional
fields added, depending on transaction type. 

Constructor requires following arguments:
```json
{
    "id": "processor.expansion.$INDY_NETWORK",
    "sourceLookups": "source.target.$INDY_NETWORK"
}
```
The `sourceLookups` lookups must be id of a source containing transactions belonging to the same network as 
to where processed transaction belongs to. The reason for this is because some transformation are looking up
ledger transactions for additional information. For example, when processing CLAIM_DEF, the SCHEMA the CLAIM_DEF
refers to is looked up to find out name and version of the referred schema.
Should be up to careful consideration whether in case of error, an exception should be thrown, or whether 
processing should return result describing the error. In case it is likely the transformation data will 
be ever back-referenced by some daemon process, exception should be thrown instead of silently failing.
On the other hand, the data involved is not critical, we might be better of reporting the error as a part of 
the transformed data.


#### `processor` interface implementation: `processor-state`
Expects to be passed domain NYM or ATTRIB transaction in `original` format. Returns representation of DID state
after applying the transaction to previously known state of the DID. 

Constructor requires following arguments:
```json
{
    "id": "processor.expansion.$INDY_NETWORK",
    "sourceLookups": "source.target.$INDY_NETWORK"
}
```


### `pipeline` interface
The pipeline is a top level object typically consuming other, previously described interface. Pipelines generally
iterate over transactions, perform some transformation on retrieved data and send results to some target.

The implement interface:
```
start()
stop()
info()
```
which is fairly self explanatory - `start` and `stop` starts or stops the pipeline cycle. `info` returns diagnostic
information about current or historical state of the pipeline run.

### `pipeline` interface: `sequential`
Leverages all previously described interfaces. 

Constructor requires following arguments:
```json
{
    "id": "pipeline.$INDY_NETWORK.pool",
    "subledger": "pool",
    "iterator": "iterator.$INDY_NETWORK",
    "requestTxFormat": "original",
    "processor": "processor.expansion.$INDY_NETWORK",
    "target": "target.$INDY_NETWORK",
    "timing": {
      "timeoutOnSuccess": 1000,
      "timeoutOnTxIngestionError": 5000,
      "timeoutOnTxProcessingError": 5000,
      "timeoutOnLedgerResolutionError": 4000,
      "timeoutOnTxNoFound": 0.4
    }
}
```

Whereas 
- `subledger` - specifies the subledger this pipeline is processing
- `timing` - specifies timeouts between individual pipeline runs, depending on various events. You can either set up
  timeout values yourself or use preset by supplying one of following strings as value: `SLOW`, `MEDIUM`, `FAST`, 
  `TURBO`.
- `iterator` - is ID of object implementing `iterator` interface. First stage of the pipeline begins here. 
  If iterator returns `undefined`, ie. no transaction is yet available, the pipeline will retry again after 
  `timeoutOnTxNoFound`ms. If an error occurs, the run is aborted and next pipeline run will run after 
  `timeoutOnLedgerResolutionError`ms. If transaction was received, it's send to a processor.
- `processor` - is ID of object implementing `processor` interface. Transaction from iterator is processed.
  The output of transformation is sent to `target`. If exception is thrown during processing, pipeline is aborted
  and reruns after `timeoutOnTxProcessingError` ms. 
- `target` - is ID of object implementing `target` interface. The transaction is stored. If an exception is thrown,
  pipeline run is aborted and reruns after `timeoutOnTxIngestionError`ms. 

If during the pipeline run an except


