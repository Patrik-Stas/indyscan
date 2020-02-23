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
- `source` as transaction source [Details](./src/sources/readme.md)
- `target` as destination to send transactions to [Details](./src/targets/readme.md)
- `processor` for transforming transaction into different formats [Details](./src/processors/readme.md)
- `iterator`, for iterating over some transactions [Details](./src/iterators/readme.md)
- `worker` for executing some work [Details](./src/pipelines/readme.md)



