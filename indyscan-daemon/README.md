# Indyscan Daemon
In basic setup copies transactions from ledger into elasticsearch database and performs
transformations on this data to make them easier to process.

The architecture is based on concept of **"workers"**. Currently there's 1 type of worker 
implemented in Indyscan called `RTW`. This stands for `Read-Transform-Write`.
One RTW worker runs against 1 subledger of 1 indy network. 

RTW worker turned out to be nice generalization which can accomodate various types of workloads.
RTW worker can be given transaction source (such as ledger, database), pipeline of 
transformations to perform on the data read from the source, and some destination 
where transformed data shall be sent. 
 
Example of RTW workers:
1. Worker `RTW1` is copying domain transactions from Sovrin Mainnet into `sovmain` elasticsearch
index.
2. Worker `RTW2` reads raw ledger transactions from `sovmain` ES index, transforms data and 
writes them back to `sovmain` ES index.
3. Worker 3 reads data from one elasticsearch instance and write them into another 
elasticsearch.   

# Configuration
To start up daemon, you need to specify in configuration what kind of workers should be 
created upon startup. Configuration has 2 parts

## Main configuration
Main properties of daemon are specified by environment variables. 

Example:
```
WORKER_CONFIGS=app-configs/sovmain.json,app-configs/sovstaging.json,app-configs/sovbuilder.json
LOG_LEVEL=debug
LOG_ES_URL=http://localhost:9200
SERVER_ENABLED=true
SERVER_PORT=3709
LOG_HTTP_REQUESTS=true
LOG_HTTP_RESPONSES=true
AUTOSTART=true
ENABLE_LOGFILES=true
```

Details:
- `WORKER_CONFIGS` - comma separated list of paths to worker configurations (more about that later).

- `LOG_LEVEL` - Specifies verbosity of output. Accepted values: `error`, `warn`, `info`, `debug`, `silly`.

- `ENABLE_LOGFILES` - If `ENABLE_LOGFILES` is `true`, each winston logger also stores logs into files in `logs` directory.

- `LOG_ES_URL` - If specified, all logs will be sent to elasticsearch on specified URL.

- `SERVER_ENABLED` - Daemon comes with HTTP server to manage workers. If set to `false`, HTTP server won't be started.

- `SERVER_PORT` - If `SERVER_ENABLED` is `true`, the HTTP Server will be running on specified port.

- `LOG_HTTP_REQUESTS` - If `SERVER_ENABLED` is `true`, this specifies whether incoming HTTP requests shall be logged.

- `LOG_HTTP_RESPONSES` - If `SERVER_ENABLED` is `true`, this specifies whether outgoing HTTP responses shall be logged.

- `AUTOSTART` - Specifies whether workers defined by `WORKER_CONFIGS` config files shall be automatically started. If 
set to `false`, you will have to enable workers either by calling server API or via `indyscan-daemon-ui` 
(which hooks up to the daemon HTTP API)

## Worker configuration
The workers to be ran by daemon are specified by worker configuration files. Typically
you won't need to write these but rather just slightly adjust ones that are provided to your 
particular setup. 

Here's example of worker configuration file. 
```json
{
  "env": {
    "INDY_NETWORK": "HOST_DOCKER_INTERNAL",
    "ES_URL": "http://localhost:9200",
    "ES_INDEX": "txs-localdocker"
  },
  "workersBuildersTemplate": [
    {
      "builder": "rtwSerialization",
      "params": {
        "indyNetworkId": "{{{INDY_NETWORK}}}",
        "genesisPath": "{{{cfgdir}}}/genesis/{{{INDY_NETWORK}}}.txn",
        "esUrl": "{{{ES_URL}}}",
        "esIndex": "{{{ES_INDEX}}}",
        "workerTiming": "FAST"
      }
    },
    {
      "builder": "rtwExpansion",
      "params": {
        "indyNetworkId": "{{{INDY_NETWORK}}}",
        "esUrl": "{{{ES_URL}}}",
        "esIndex": "{{{ES_INDEX}}}",
        "workerTiming": "FAST"
      }
    }
  ]
}
```

The worker config has 2 parts: `env` and `workersBuildersTemplate`. 
- `env` section specifies variables and their values to be interpolated into 
`workersBuildersTemplate` section.
- `workersBuildersTemplate` - specifies workers. Each builder in the example 
actually stands up 3 RTW workers - 3 workers per network. 
  1. The `rtwSerialization` worker builder create workers which copy data 
  from ledger to elasticsearch.
  2. The `rtwExpansion` worker builder create workers which read raw transactions 
  data from the elasticsearch, transform data into different, easier to consume format,
  and write back to elasticsearch as a different representation of the transaction.
