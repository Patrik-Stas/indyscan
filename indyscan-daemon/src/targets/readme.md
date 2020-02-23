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
