# `source` interface

Implements interface:
```
async getTxData(subledger, seqNo, format)
async getHighestSeqno(subledger, format)
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
